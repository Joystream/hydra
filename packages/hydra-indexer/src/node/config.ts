/* eslint-disable @typescript-eslint/naming-convention */
import { cleanEnv, str, num, url, makeValidator, bool } from 'envalid'
import path from 'path'
import fs from 'fs'
import Debug from 'debug'

let conf: {
  BLOCK_HEIGHT: number
  FORCE_HEIGHT: boolean
  VERBOSE: boolean
  //LOG_CONFIG: string
  DEBUG: string
  TYPES_JSON: Record<string, unknown>
  SPEC_TYPES: Record<string, unknown>
  CHAIN_TYPES: Record<string, unknown>
  BUNDLE_TYPES: Record<string, unknown>
  WS_PROVIDER_ENDPOINT_URI: string
  NODE_PING_INTERVAL: number
  REDIS_URI: string
}

const jsonPath = makeValidator<Record<string, unknown>>(
  (p: string | undefined): Record<string, unknown> => {
    if (p === undefined || p === '' || p === 'undefined') {
      return {}
    }

    let jsonFile: string
    try {
      jsonFile = fs.readFileSync(path.resolve(p), 'utf-8')
    } catch {
      throw new Error(`Can't open file ${p}`)
    }
    try {
      return JSON.parse(jsonFile)
    } catch {
      throw new Error(`Invalid JSON: ${p}`)
    }
  }
)

export function configure(): void {
  conf = cleanEnv(process.env, {
    BLOCK_HEIGHT: num({
      default: 0,
      desc: `Block height the indexer starts from. If there are indexed blocks, it continues from the last unprocessed block`,
    }),
    FORCE_HEIGHT: bool({
      default: false,
      desc: 'If set to true, will enforce BLOCH_HEIGHT',
    }),
    DEBUG: str({ default: 'hydra-indexer:*,index-builder:*' }),
    VERBOSE: bool({
      default: false,
      desc: 'Extra verbosity in the debug output',
    }),
    TYPES_JSON: jsonPath(), // optional
    SPEC_TYPES: jsonPath(),
    CHAIN_TYPES: jsonPath(),
    BUNDLE_TYPES: jsonPath(),
    WS_PROVIDER_ENDPOINT_URI: url(),
    REDIS_URI: url(),
    NODE_PING_INTERVAL: num({
      default: 60 * 1000,
      desc: 'Interval for pinging the substate node health',
    }),
  })

  Debug.enable(conf.DEBUG)
}

export function getConfig() {
  if (conf !== undefined) return conf
  configure()
  return conf
}
