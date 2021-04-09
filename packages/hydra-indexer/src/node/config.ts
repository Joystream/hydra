/* eslint-disable @typescript-eslint/naming-convention */
import { cleanEnv, str, num, url, makeValidator, bool, port } from 'envalid'
import path from 'path'
import fs from 'fs'
import Debug from 'debug'

let conf: {
  BLOCK_HEIGHT: number
  FORCE_HEIGHT: boolean
  VERBOSE: boolean
  DEBUG: string
  TYPES_JSON: Record<string, unknown>
  SPEC_TYPES: Record<string, unknown>
  CHAIN_TYPES: Record<string, unknown>
  BUNDLE_TYPES: Record<string, unknown>
  WS_PROVIDER_ENDPOINT_URI: string
  NODE_PING_INTERVAL: number
  REDIS_URI: string
  DB_HOST: string
  DB_PORT: number
  DB_NAME: string
  DB_USER: string
  DB_PASS: string
  DB_LOGGING: string
}

let dbConf: {
  DB_HOST: string
  DB_PORT: number
  DB_NAME: string
  DB_USER: string
  DB_PASS: string
  DB_LOGGING: string
}

const jsonPath = makeValidator<Record<string, unknown>>(
  (p: string | undefined | unknown): Record<string, unknown> => {
    if (p === undefined || p === '' || p === 'undefined') {
      return {}
    }

    if (typeof p === 'object') {
      return p as Record<string, unknown>
    }

    let jsonFile: string
    try {
      jsonFile = fs.readFileSync(path.resolve(<string>p), 'utf-8')
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

function removeUndefinedEnvs(): void {
  Object.keys(process.env).map((key) => {
    if (process.env[key] === 'undefined' || process.env[key] === '') {
      delete process.env[key]
    }
  })
}

export function dbConfigure(): void {
  process.env.DB_HOST = process.env.TYPEORM_HOST || process.env.DB_HOST
  process.env.DB_PORT = process.env.TYPEORM_PORT || process.env.DB_PORT
  process.env.DB_USER = process.env.TYPEORM_USERNAME || process.env.DB_USER
  process.env.DB_PASS = process.env.TYPEORM_PASSWORD || process.env.DB_PASS
  process.env.DB_NAME = process.env.TYPEORM_DATABASE || process.env.DB_NAME
  process.env.DB_LOGGING = process.env.TYPEORM_LOGGING || process.env.DB_LOGGING

  removeUndefinedEnvs()

  dbConf = cleanEnv(process.env, {
    DB_NAME: str(),
    DB_HOST: str({ devDefault: 'localhost', desc: `Database host` }),
    DB_PORT: port({ devDefault: 5432, desc: `Database port` }),
    DB_USER: str({ devDefault: 'postgres', desc: `Database user` }),
    DB_PASS: str({ devDefault: 'postgres', desc: `Database user passowrd` }),
    DB_LOGGING: str({
      choices: [
        'error',
        'query',
        'schema',
        'warn',
        'info',
        'log',
        'true',
        'all',
      ],
      default: 'error',
      desc: 'Typeorm logging level',
    }),
  })
}

export function configure(): void {
  removeUndefinedEnvs()

  conf = {
    ...cleanEnv(process.env, {
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
      TYPES_JSON: jsonPath({
        default: {},
        desc: `path to JSON with custom substrate type definitions`,
      }), // optional
      SPEC_TYPES: jsonPath({
        default: {},
        desc: `path to JSON with spec-level type definitions`,
      }),
      CHAIN_TYPES: jsonPath({
        default: {},
        desc: `path to JSON with chain-level type definitions`,
      }),
      BUNDLE_TYPES: jsonPath({
        default: {},
        desc: `path to JSON with bundle type definitions`,
      }),
      WS_PROVIDER_ENDPOINT_URI: url(),
      REDIS_URI: url(),
      NODE_PING_INTERVAL: num({
        default: 60 * 1000,
        desc: 'Interval for pinging the substate node health',
      }),
    }),
    ...getDBConfig(),
  }

  Debug.enable(conf.DEBUG)
}

export function getDBConfig(): typeof dbConf {
  if (dbConf !== undefined) return dbConf
  dbConfigure()
  return dbConf
}

export function getConfig(): typeof conf {
  if (conf !== undefined) return conf
  configure()
  return conf
}
