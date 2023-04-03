import path from 'path'
import { GeneratorConfig } from '.'
import { IConfig } from '../commands/typegen'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import { handlebars } from './helpers'

const debug = require('debug')('hydra-typegen:gen-root-index')

const generateRootIndexTemplate = handlebars.compile(readTemplate('rootIndex'))

export function generateRootIndex(
  { outDir }: IConfig,
  generatorConfigs: GeneratorConfig[]
): void {
  writeFile(path.join(outDir, `index.ts`), () =>
    formatWithPrettier(
      generateRootIndexTemplate({
        rootImports: generatorConfigs.map(({ specVersion }) => ({
          specVersion,
        })),
      })
    )
  )
  debug('Done writing root index')
}
