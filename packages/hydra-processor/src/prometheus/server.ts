import express from 'express'
import { Server } from 'http'
import { register, validateMetricName } from 'prom-client'
import { getConfig as conf } from '../start/config'
import { info } from '../util/log'

export function startPromEndpoint(): Server {
  const server = express()

  // Setup server to Prometheus scrapes:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server.get('/metrics', (req: any, res: any) => {
    try {
      if (req.query.json === 'true') {
        res.json(register.getMetricsAsJSON())
      } else {
        res.set('Content-Type', register.contentType)
        res.end(register.metrics())
      }
    } catch (ex) {
      res.status(500).end(ex)
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server.get('/metrics/:metricName', (req: any, res: any) => {
    try {
      res.set('Content-Type', register.contentType)
      if (
        !req.params.metricName ||
        !validateMetricName(req.params.metricName)
      ) {
        res.status(400).end('No requested metric found')
      }
      res.end(register.getSingleMetricAsString(req.params.metricName))
    } catch (ex) {
      res.status(500).end(ex)
    }
  })

  const port = conf().PROMETHEUS_PORT
  const app = server.listen(port)
  info(
    `Prometheus server is listening on port ${port}. Hydra-Processor metrics are available at localhost:${port}/metrics`
  )
  return app
}
