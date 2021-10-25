import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import YamlValidator from 'yaml-validator'
import * as log from './log'

export interface Config {
  outDir: string
  metadata?: {
    source?: string
    blockHash?: string
  }
  events?: string[]
  calls?: string[]
  customTypes?: CustomTypes
  strict?: boolean
}

export interface CustomTypes {
  lib: string
  typedefsLoc: string
}

export function loadConfig(manifestFile: string): Config {
  const validator = new YamlValidator({
    structure: {
      typegen: {
        'metadata?': {
          'source?': 'string',
          'blockHash?': 'string',
        },
        'customTypes?': {
          lib: 'string',
          typedefsLoc: 'string',
        },
        'events?': ['string'],
        'calls?': ['string'],
        outDir: 'string',
        'strict?': 'boolean',
      },
    },
    onWarning: function (error: unknown, filepath: unknown) {
      log.error(filepath + ' has error: ' + error)
    },
  })

  validator.validate([manifestFile])
  if (validator.report()) {
    throw new Error(
      `Invalid config file at location ${manifestFile}: ${validator.logs.join(
        '\n'
      )}`
    )
  }

  const config: Config = YAML.parse(
    fs.readFileSync(manifestFile, 'utf8')
  ).typegen
  validateConfig(config)
  return config
}

export function validateConfig(config: Config): void {
  if (!config.events?.length && !config.calls?.length) {
    throw new Error(
      `Nothing to generate: at least one event or call should be provided.`
    )
  }

  if (config.customTypes) {
    if (config.customTypes.typedefsLoc == null) {
      throw new Error(
        `Missing the type definition location for the custom for types. Did you forget to add typedefsLoc?`
      )
    }
    const typedefsPath = path.resolve(config.customTypes.typedefsLoc)
    if (!fs.existsSync(typedefsPath)) {
      throw new Error(`Cannot find type definition file at ${typedefsPath}`)
    }
  }
}
