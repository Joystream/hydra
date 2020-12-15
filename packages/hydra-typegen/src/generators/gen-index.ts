import fs from 'fs'
import path from 'path'
import { GeneratorConfig } from '.'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import { handlebars } from './helpers'

const debug = require('debug')('hydra-typegen:gen-index')

const generateIndexTemplate = handlebars.compile(readTemplate('index'))

export function generateIndex(config: GeneratorConfig) {
  const { modules, customTypes, dest } = config

  if (customTypes && customTypes.typedefsLoc) {
    fs.copyFileSync(customTypes.typedefsLoc, path.join(dest, `typedefs.json`))
  }

  writeFile(path.join(dest, `index.ts`), () =>
    formatWithPrettier(
      generateIndexTemplate({
        modules: modules.map((m) => m.module),
        hasTypeDefs:
          customTypes !== undefined && customTypes.typedefsLoc !== undefined,
      })
    )
  )
  debug('Done writing index')
}
