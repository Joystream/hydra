/* eslint-disable @typescript-eslint/naming-convention */
import { cleanEnv, str, num, bool } from 'envalid'
import { parseManifest, ProcessorManifest } from './manifest'
import Debug from 'debug'
import { setWarthogEnvs } from '../db/ormconfig'

let conf: {
  // manifest file location
  MANIFEST_PATH: string
  // url of the indexer to connect to
  INDEXER_ENDPOINT_URL: string
  NAME: string
  ID: string
  // debug pattern
  DEBUG: string
  // extra debug output
  VERBOSE: boolean
  PROMETHEUS_PORT: number
  // the query tries to events from the current block to block + BLOCK_WINDOW
  BLOCK_WINDOW: number
  PROCESSOR_NAME: string
  // Interval at which the processor pulls new blocks from the database
  // The interval is reasonably large by default. The trade-off is the latency
  // between the updates and the load to the database
  // It will be replaced by a poll-free subscription in the future
  POLL_INTERVAL_MS: number

  // Maximal number of events to process in a single transaction
  BATCH_SIZE: number

  // multiplication factors to calculate the queue batch, queue cap, and fetch batch size
  // in terms of the BATCH_SIZE
  QUEUE_FACTOR: number
  QUEUE_MAX_CAP_FACTOR: number
  MAPPINGS_FACTOR: number

  // Wait for the indexer head block to be ahead for at least that number of blocks
  MIN_BLOCKS_AHEAD: number
  // batch size taken by the processor
  MAPPINGS_BATCH_SIZE: number
  // max batch size
  QUEUE_BATCH_SIZE: number
  // max queue capacity
  EVENT_QUEUE_MAX_CAPACITY: number

  BLOCK_CACHE_CAPACITY: number

  STATE_UPDATE_ENDPOINT: string
}

export function configure(): void {
  const envConf = cleanEnv(process.env, {
    MANIFEST_PATH: str({ default: 'manifest.yml' }),
    INDEXER_ENDPOINT_URL: str({ devDefault: 'http://localhost:4001' }),
    NAME: str({ default: 'Hydra-Processor' }),
    ID: str({ default: 'hydra-processor' }),
    DEBUG: str({ default: 'hydra-processor:*' }),
    VERBOSE: bool({ default: false }),
    PROMETHEUS_PORT: num({ default: 3000 }),
    BLOCK_WINDOW: num({ default: 100000 }),
    PROCESSOR_NAME: str({ default: 'hydra-processor' }),
    BATCH_SIZE: num({ default: 1000 }),
    POLL_INTERVAL_MS: num({ default: 500 }),
    MIN_BLOCKS_AHEAD: num({ default: 0 }),
    MAPPINGS_FACTOR: num({ default: 1 }),
    QUEUE_FACTOR: num({ default: 2 }),
    QUEUE_MAX_CAP_FACTOR: num({ default: 5 }),
    BLOCK_CACHE_CAPACITY: num({ default: 10000 }),
    STATE_UPDATE_ENDPOINT: str({
      devDefault: 'http://localhost:8082/update-processor-state',
    }),
  })
  conf = {
    ...envConf,
    MAPPINGS_BATCH_SIZE: envConf.BATCH_SIZE * envConf.MAPPINGS_FACTOR,
    QUEUE_BATCH_SIZE: envConf.BATCH_SIZE * envConf.QUEUE_FACTOR,
    EVENT_QUEUE_MAX_CAPACITY: envConf.BATCH_SIZE * envConf.QUEUE_MAX_CAP_FACTOR,
  }
  setWarthogEnvs()
  Debug.enable(conf.DEBUG)
}

let manifest: ProcessorManifest | undefined

export function getConfig(): typeof conf {
  if (conf !== undefined) return conf
  configure()
  return conf
}

export function getManifest(): ProcessorManifest {
  if (manifest === undefined) {
    manifest = parseManifest(getConfig().MANIFEST_PATH)
  }
  return manifest
}
