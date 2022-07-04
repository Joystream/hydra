import { ExtractedModuleMeta } from '../metadata'
import { Metadata } from '@polkadot/types/metadata'

export type GeneratorConfig = {
  modules: ExtractedModuleMeta[]
  importsRegistry: ImportsRegistry
  originalMetadata: Metadata
  dest: string
  validateArgs: boolean
}

// these map all the codec and primitive types for import, see the ImportsDef below. If
// we have an unseen type, it is `undefined`/`false`, if we need to import it, it is `true`
export type TypeExist = Record<string, boolean>

// registry of all avaialable type imports and their resolutions
export type ImportsRegistry = Record<string, string>
// maps file to import from to the set of imports
export type ImportsDef = Record<string, TypeExist>
