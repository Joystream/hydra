import fs from 'fs'
import path from 'path'
import { GeneratorConfig } from '.'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import { handlebars } from './helpers'

const debug = require('debug')('hydra-typegen:gen-index')

const generateIndexTemplate = handlebars.compile(readTemplate('index'))

export function generateIndex({
  modules,
  customTypes,
  dest,
}: GeneratorConfig): void {
  if (customTypes) {
    const typedefsPath = path.resolve(customTypes.typedefsLoc)
    fs.copyFileSync(typedefsPath, path.join(dest, `typedefs.json`))
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
