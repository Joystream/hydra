import fs from 'fs'
import path from 'path'
import { GeneratorConfig } from '.'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import { handlebars } from './helpers'

const debug = require('debug')('hydra-typegen:gen-typeRegistry')

const generateTypeRegistryTemplate = handlebars.compile(
  readTemplate('typeRegistry')
)

export function generateTypeRegistry({
  dest,
  originalMetadata,
}: GeneratorConfig): void {
  fs.writeFileSync(
    path.join(dest, `metadata.json`),
    JSON.stringify({
      'id': 1,
      'jsonrpc': '2.0',
      result: originalMetadata.toHex(),
    })
  )

  writeFile(path.join(dest, `typeRegistry.ts`), () =>
    formatWithPrettier(generateTypeRegistryTemplate({}))
  )
  debug('Done writing typeRegistry')
}
