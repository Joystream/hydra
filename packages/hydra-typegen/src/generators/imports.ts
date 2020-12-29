import { GeneratorConfig, ImportsDef } from './types'
import { ModuleMeta, stripTypes } from '../metadata'

export function buildModuleImports(
  { types }: ModuleMeta,
  { importsRegistry }: GeneratorConfig
): ImportsDef {
  const importsDef: ImportsDef = {}

  types.forEach((i) => {
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
