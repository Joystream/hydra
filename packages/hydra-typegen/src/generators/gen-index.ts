import path from 'path'
import { GeneratorConfig } from '.'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import { handlebars } from './helpers'

const debug = require('debug')('hydra-typegen:gen-index')

const generateIndexTemplate = handlebars.compile(readTemplate('index'))

export function generateIndex({ modules, dest }: GeneratorConfig): void {
  writeFile(path.join(dest, `index.ts`), () =>
    formatWithPrettier(
      generateIndexTemplate({
        modules: modules.map((m) => m.module),
      })
    )
  )
  debug('Done writing index')
}
