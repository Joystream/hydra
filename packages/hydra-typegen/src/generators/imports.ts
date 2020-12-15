import { GeneratorConfig, ImportsDef } from './types'
import { ModuleMeta, strippedArgTypes } from '../metadata'

const debug = require('debug')('hydra-typegen:imports')

export function buildModuleImports(
  { events }: ModuleMeta,
  { importsRegistry }: GeneratorConfig
): ImportsDef {
  const allToImport: string[] = []

  events.forEach((e) => allToImport.push(...strippedArgTypes(e)))

  const importsDef: ImportsDef = {}

  allToImport.forEach((i) => {
    if (importsRegistry[i] === undefined) {
      throw new Error(`Cannot resolve import for type ${i}`)
    }
    if (!importsDef[importsRegistry[i]]) {
      importsDef[importsRegistry[i]] = {}
    }
    importsDef[importsRegistry[i]][i] = true
  })

  return importsDef
}
