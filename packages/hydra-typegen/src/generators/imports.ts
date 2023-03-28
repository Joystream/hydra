import { GeneratorConfig, ImportsDef } from './types'
import { ExtractedModuleMeta } from '../metadata'

export function buildModuleImports(
  { types }: ExtractedModuleMeta,
  { importsRegistry }: GeneratorConfig
): ImportsDef {
  const importsDef: ImportsDef = {}

  types.forEach((i) => {
    const importLoc = importsRegistry[i] || './types-lookup'

    if (!importsDef[importLoc]) {
      importsDef[importLoc] = {}
    }
    importsDef[importLoc][i] = true
  })

  return importsDef
}
