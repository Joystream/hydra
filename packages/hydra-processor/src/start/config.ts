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
  // Maximal number of events to process in a single transaction
  BATCH_SIZE: number
  // Interval at which the processor pulls new blocks from the database
  // The interval is reasonably large by default. The trade-off is the latency
  // between the updates and the load to the database
  // It will be replaced by a poll-free subscription in the future
  POLL_INTERVAL_MS: number
  // Wait for the indexer head block to be ahead for at least that number of blocks
  MIN_BLOCKS_AHEAD: number
}

export function configure(): void {
  conf = cleanEnv(process.env, {
    MANIFEST_PATH: str({ default: 'manifest.yml' }),
    INDEXER_ENDPOINT_URL: str({ devDefault: 'http://localhost:4001' }),
    NAME: str({ default: 'Hydra-Processor' }),
    ID: str({ default: 'hydra-processor' }),
    DEBUG: str({ default: 'hydra-processor:*' }),
    VERBOSE: bool({ default: false }),
    PROMETHEUS_PORT: num({ default: 3000 }),
    BLOCK_WINDOW: num({ default: 100000 }),
    PROCESSOR_NAME: str({ default: 'hydra-processor' }),
    BATCH_SIZE: num({ default: 10 }),
    POLL_INTERVAL_MS: num({ default: 60 * 1000 }),
    MIN_BLOCKS_AHEAD: num({ default: 0 }),
  })
  setWarthogEnvs()
  Debug.enable(conf.DEBUG)
}

let manifest: ProcessorManifest | undefined

export function getConfig() {
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
