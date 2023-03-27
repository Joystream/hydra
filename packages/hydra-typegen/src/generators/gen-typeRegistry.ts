import path from 'path'
import { GeneratorConfig } from '.'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import { handlebars } from './helpers'

const debug = require('debug')('hydra-typegen:gen-typeRegistry')

const generateTypeRegistryTemplate = handlebars.compile(
  readTemplate('typeRegistry')
)

export function generateTypeRegistry({ dest }: GeneratorConfig): void {
  writeFile(path.join(dest, `typeRegistry.ts`), () =>
    formatWithPrettier(generateTypeRegistryTemplate({}))
  )
  debug('Done writing typeRegistry')
}
