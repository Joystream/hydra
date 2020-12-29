import { ModuleMeta } from '../metadata'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import path from 'path'
import { buildModuleImports } from './imports'
import { GeneratorConfig } from '.'
import { handlebars } from './helpers'
import { kebabCase } from 'lodash'

const debug = require('debug')('hydra-typegen:gen-events')

const generateModuleTemplate = handlebars.compile(readTemplate('module'))

export function generateModuleTypes(config: GeneratorConfig): void {
  const { modules, dest } = config
  modules.forEach((meta) => {
    const { module } = meta
    const props = buildModuleProps(meta, config)
    writeFile(path.join(dest, `${kebabCase(module.name.toString())}.ts`), () =>
      formatWithPrettier(generateModuleTemplate(props))
    )
  })
  debug('Done writing event types')
}

export function buildModuleProps(
  meta: ModuleMeta,
  config: GeneratorConfig
): unknown {
  const { validateArgs } = config
  const imports = buildModuleImports(meta, config)

  debug(`Imports: ${JSON.stringify(imports, null, 2)}`)

  return {
    validateArgs,
    imports,
    ...meta,
  }
}
