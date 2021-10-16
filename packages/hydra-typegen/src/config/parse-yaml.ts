import YamlValidator from 'yaml-validator'
import fs from 'fs'
import YAML from 'yaml'

import { error as logError } from '../log'
import { IConfig } from '../commands/typegen'

const options = {
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
    logError(filepath + ' has error: ' + error)
  },
}

export function parseConfigFile(location: string): IConfig {
  const validator = new YamlValidator(options)
  validator.validate([location])

  if (validator.report()) {
    throw new Error(
      `Invalid config file at location ${location}: ${validator.logs.join(
        '\n'
      )}`
    )
  }
  const { typegen } = YAML.parse(fs.readFileSync(location, 'utf8'))
  return {
    ...typegen,
    events: typegen.events || [],
    calls: typegen.calls || [],
  } as IConfig
}
