import { ModuleMeta } from '../metadata'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import path from 'path'
import { buildModuleImports } from './imports'
import { GeneratorConfig } from '.'
import { handlebars } from './helpers'
import { kebabCase } from 'lodash'

const debug = require('debug')('hydra-typegen:gen-events')

const generateEventTypeTemplate = handlebars.compile(readTemplate('events'))

export function generateEventTypes(config: GeneratorConfig) {
  const { modules, dest } = config
  modules.forEach((meta) => {
    const { module } = meta
    writeFile(path.join(dest, `${kebabCase(module.name.toString())}.ts`), () =>
      formatWithPrettier(getEventTypes(meta, config))
    )
  })
  debug('Done writing event types')
}

export function getEventTypes(
  meta: ModuleMeta,
  config: GeneratorConfig
): string {
  const { validateArgs } = config
  const imports = buildModuleImports(meta, config)

  debug(`Imports: ${JSON.stringify(imports, null, 2)}`)

  const { module, events } = meta
  return generateEventTypeTemplate({
    validateArgs,
    imports,
    module,
    events
  })
}
