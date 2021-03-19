/* eslint-disable @typescript-eslint/naming-convention */
import { cleanEnv, str, num, bool } from 'envalid'
import { parseManifest, ProcessorManifest } from './manifest'
import Debug from 'debug'
import { setWarthogEnvs } from '../db/ormconfig'

const preConf = cleanEnv(process.env, {
  MANIFEST_PATH: str({ default: 'manifest.yml' }),
  INDEXER_ENDPOINT_URL: str({ devDefault: 'http://localhost:4001' }),
  NAME: str({ default: 'Hydra-Processor' }),
  ID: str({ default: 'hydra-processor' }),
  DEBUG: str({ default: 'hydra-processor:*' }),
  VERBOSE: bool({ default: false }),
  PROMETHEUS_PORT: num({ default: 3000 }),
  // Number of blocks to scan in a single request to the indexe
  BLOCK_WINDOW: num({ default: 100000 }),
  PROCESSOR_NAME: str({ default: 'hydra-processor' }),
  // Maximal number of events to process in a single transaction
  BATCH_SIZE: num({
    default: 100,
  }),

  MAPPINGS_FACTOR: num({ default: 1 }),
  QUEUE_FACTOR: num({ default: 2 }),
  QUEUE_MAX_CAP_FACTOR: num({ default: 5 }),
  // Interval at which the processor pulls new blocks from the database
  // The interval is reasonably large by default. The trade-off is the latency
  // between the updates and the load to the database
  // It will be replaced by a poll-free subscription in the future
  POLL_INTERVAL_MS: num({ default: 3 * 1000 }),
  // Wait for the indexer head block to be ahead for at least that number of blocks
  MIN_BLOCKS_AHEAD: num({ default: 0 }),
})

export const conf = {
  ...preConf,
  MAPPINGS_BATCH_SIZE: preConf.BATCH_SIZE * preConf.MAPPINGS_FACTOR,
  QUEUE_BATCH_SIZE: preConf.BATCH_SIZE * preConf.QUEUE_FACTOR,
  EVENT_QUEUE_MAX_CAPACITY: preConf.BATCH_SIZE * preConf.QUEUE_MAX_CAP_FACTOR,
}

let manifest: ProcessorManifest | undefined

export function getManifest(): ProcessorManifest {
  if (manifest === undefined) {
    manifest = parseManifest(conf.MANIFEST_PATH)
  }
  return manifest
}

setWarthogEnvs()
Debug.enable(conf.DEBUG)
