import { ExtractedModuleMeta } from '../metadata'
import { formatWithPrettier, readTemplate, writeFile } from '../util'
import path from 'path'
import { buildModuleImports } from './imports'
import { GeneratorConfig } from '.'
import { handlebars } from './helpers'
import { kebabCase } from 'lodash'
import { ImportsDef } from './types'

const debug = require('debug')('hydra-typegen:gen-modules')

const generateModuleTemplate = handlebars.compile(readTemplate('module'))

type ModuleTemplateProps = {
  validateArgs: boolean
  imports: ImportsDef
  specVersion: number
  moduleName: string
} & ExtractedModuleMeta

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
  meta: ExtractedModuleMeta,
  config: GeneratorConfig
): ModuleTemplateProps {
  const { validateArgs, specVersion } = config
  const imports = buildModuleImports(meta, config)

  debug(`Imports: ${JSON.stringify(imports, null, 2)}`)

  return {
    validateArgs,
    specVersion,
    imports,
    moduleName: meta.module.name.toString(),
    ...meta,
  }
}
