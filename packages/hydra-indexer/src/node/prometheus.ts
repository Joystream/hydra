import assert from 'assert'
import * as http from 'http'
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client'
import stoppable from 'stoppable'
import { eventEmitter, IndexerEvents } from './event-emitter'
import { FIFOCache } from '@subsquid/hydra-common'

export interface ListeningServer {
  port: number
  close(): Promise<void>
}

class Prometheus {
  private registry = new Registry()

  private blockStartTimes = new FIFOCache<number, number>(100)

  private chainLastFinalizedHeight = new Gauge({
    name: 'sqd_archive_chain_last_finalized_height',
    help: 'Last finalized block height recevied from the chain',
    registers: [this.registry],
    aggregator: 'max',
  })

  private chainBestHeight = new Gauge({
    name: 'sqd_archive_chain_best_height',
    help: 'Last best height recevied from the chain',
    registers: [this.registry],
    aggregator: 'max',
  })

  private headBlock = new Gauge({
    name: 'sqd_archive_head_block',
    help: 'Last archive head block. All the blocks up to the head have been archived.',
    registers: [this.registry],
    aggregator: 'max',
  })

  private headUpdates = new Counter({
    name: 'sqd_archive_archived_head_updates',
    help: 'Number of times the head block height has been updated',
    registers: [this.registry],
  })

  private processedEvents = new Counter({
    name: 'sqd_archive_processed_events',
    help: 'Number of archived events (including not yet commited to storage)',
    registers: [this.registry],
  })

  private eventsInBlock = new Gauge({
    name: 'sqd_archive_events_in_block',
    help: 'Peak number of events observed in a single block',
    registers: [this.registry],
    aggregator: 'max',
  })

  private chainHeightUpdates = new Counter({
    name: 'sqd_archive_chain_height_updates',
    help: 'Number of times the chain height has been updated',
    registers: [this.registry],
  })

  private ingestTime = new Histogram({
    name: 'sqd_archive_block_ingest_time_sec',
    help: 'Block ingestion and decoding time',
    registers: [this.registry],
    buckets: [0.05, 0.1, 0.5, 1, 10, 100, 1000],
  })

  private archiveTime = new Histogram({
    name: 'sqd_archive_block_archival_time_sec',
    help: 'End to end block archival time',
    registers: [this.registry],
    buckets: [0.05, 0.1, 0.5, 1, 10, 100, 1000],
  })

  private gRPCRequestTime = new Histogram({
    name: 'sqd_arhive_grpc_request_time',
    help: 'Distribution of the gRPC requests to the node endpoint',
    registers: [this.registry],
    labelNames: ['method', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10],
  })

  gRPCRequestHistogram(): Histogram<'method' | 'status'> {
    return this.gRPCRequestTime
  }

  getProcessedEventsCounter(): Counter<string> {
    return this.processedEvents
  }

  getEventsInBlock(): Gauge<string> {
    return this.eventsInBlock
  }

  constructor() {
    collectDefaultMetrics({ register: this.registry })

    eventEmitter.on(IndexerEvents.BLOCK_STARTED, ({ height }) =>
      this.blockStartTimes.put(height, Date.now())
    )

    eventEmitter.on(IndexerEvents.BLOCK_INGESTION_COMPLETE, ({ height }) => {
      const start = this.blockStartTimes.get(height)
      if (start === undefined) {
        return
      }
      this.ingestTime.observe((Date.now() - start) / 1000)
    })

    eventEmitter.on(IndexerEvents.BLOCK_COMPLETED, ({ height }) => {
      const start = this.blockStartTimes.get(height)
      if (start === undefined) {
        return
      }
      this.archiveTime.observe((Date.now() - start) / 1000)
    })

    // We cache block headers to save on API calls
    eventEmitter.on(IndexerEvents.NEW_FINALIZED_HEAD, ({ height }) => {
      this.chainLastFinalizedHeight.set(height)
      this.chainHeightUpdates.inc()
    })

    eventEmitter.on(IndexerEvents.NEW_BEST_HEAD, ({ height }) => {
      this.chainBestHeight.set(height)
    })

    eventEmitter.on(IndexerEvents.NEW_ARCHIVE_HEAD, ({ height }) => {
      this.headUpdates.inc()
      this.headBlock.set(height)
    })
  }

  private async handleHttpRequest(
    req: http.IncomingMessage,
    // eslint-disable-next-line
    send: (status: number, body?: string | object, type?: string) => void
  ): Promise<void> {
    assert(req.url != null, `Request url is undefined`)
    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = url.pathname.slice(1).split('/')
    if (path[0] !== 'metrics') return send(404)
    const metricName = path[1]
    if (metricName) {
      if (this.registry.getSingleMetric(metricName)) {
        const value = await this.registry.getSingleMetricAsString(metricName)
        return send(200, value)
      } else {
        return send(404, 'requested metric not found')
      }
    } else if (url.searchParams.get('json') === 'true') {
      const value = await this.registry.getMetricsAsJSON()
      return send(200, value)
    } else {
      const value = await this.registry.metrics()
      return send(200, value, this.registry.contentType)
    }
  }

  serve(port: number | string): Promise<ListeningServer> {
    function send(
      res: http.ServerResponse,
      status: number,
      // eslint-disable-next-line
      body?: string | object,
      type?: string
    ): void {
      body = body || http.STATUS_CODES[status] || ''
      type =
        type || (typeof body === 'string' ? 'text/plain' : 'application/json')
      if (typeof body !== 'string') {
        body = JSON.stringify(body)
      }
      res.statusCode = status
      res.setHeader('content-type', type + '; charset=UTF-8')
      res.setHeader('content-length', Buffer.byteLength(body))
      res.end(body)
    }

    const server = stoppable(
      http.createServer(async (req, res) => {
        try {
          await this.handleHttpRequest(req, send.bind(this, res))
        } catch (err: any) {
          if (res.headersSent) {
            res.destroy()
          } else {
            send(res, 500, err.stack)
          }
        }
      })
    )

    function close(): Promise<void> {
      return new Promise((resolve, reject) => {
        server.stop((err, gracefully) => {
          if (gracefully) {
            resolve()
          } else {
            reject(err || new Error('Failed to shutdown gracefully'))
          }
        })
      })
    }

    return new Promise<ListeningServer>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err)
        } else {
          const address = server.address()
          assert(address != null && typeof address === 'object')
          resolve({
            port: address.port,
            close,
          })
        }
      })
    })
  }
}

export const prometheus = new Prometheus()