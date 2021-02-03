/* eslint-disable @typescript-eslint/naming-convention */
import { cleanEnv, str, num } from 'envalid'
import { parseManifest, ProcessorManifest } from './manifest'
import Debug from 'debug'
import { setWarthogEnvs } from '../db/ormconfig'

export const conf = cleanEnv(process.env, {
  MANIFEST_PATH: str({ default: 'manifest.yml' }),
  INDEXER_ENDPOINT_URL: str({ devDefault: 'http://localhost:4001' }),
  NAME: str({ default: 'Hydra-Processor' }),
  ID: str({ default: 'hydra-processor' }),
  DEBUG: str({ default: 'hydra-processor:*' }),
  PROMETHEUS_PORT: num({ default: 3000 }),
  // Number of blocks to scan in a single request to the indexe
  BLOCK_WINDOW: num({ default: 100000 }),
  PROCESSOR_NAME: str({ default: 'hydra-processor' }),
  // Maximal number of events to process in a single transaction
  BATCH_SIZE: num({ default: 10 }),
  // Interval at which the processor pulls new blocks from the database
  // The interval is reasonably large by default. The trade-off is the latency
  // between the updates and the load to the database
  POLL_INTERVAL_MS: num({ default: 60 * 1000 }),
  // Wait for the indexer head block to be ahead for at least that number of blocks
  MIN_BLOCKS_AHEAD: num({ default: 2 }),
})

let manifest: ProcessorManifest | undefined

export function getManifest(): ProcessorManifest {
  if (manifest === undefined) {
    manifest = parseManifest(conf.MANIFEST_PATH)
  }
  return manifest
}

setWarthogEnvs()
Debug.enable(conf.DEBUG)
