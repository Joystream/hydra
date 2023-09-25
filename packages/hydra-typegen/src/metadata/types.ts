import { PalletMetadataLatest } from '@polkadot/types/interfaces/metadata'
import { Text } from '@polkadot/types/primitive'
import { lowerCase } from 'lodash'

export type ExtractedParam = {
  name?: string
  type: string
}

export type ExtractedVaraintData = {
  params: ExtractedParam[]
  documentation: string[]
  name: string
}

export type ExtractedModuleMeta = {
  module: PalletMetadataLatest
  events: ExtractedVaraintData[]
  calls: ExtractedVaraintData[]
  types: string[]
}

export type MetaExtractionResult = {
  extracted: ExtractedModuleMeta[]
  missingEvents: string[]
  missingCalls: string[]
}

export function weakEquals(s1: string | Text, s2: string | Text): boolean {
  if (s1 === undefined || s2 === undefined) {
    return false
  }
  return lowerCase(s1.toString()) === lowerCase(s2.toString())
}
