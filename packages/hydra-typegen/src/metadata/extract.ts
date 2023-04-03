import { Metadata } from '@polkadot/types'
import {
  MetadataLatest,
  PalletMetadataLatest,
} from '@polkadot/types/interfaces/metadata'
import { Si1Variant } from '@polkadot/types/interfaces/scaleInfo'
import { TypeDef } from '@polkadot/types/types'
import { uniq } from 'lodash'
import { IConfig } from '../commands/typegen'
import { pushToDictionary } from '../util'
import { ExtractedModuleMeta, ExtractedVaraintData, weakEquals } from './types'

const debug = require('debug')('hydra-typegen:extract')

export async function extractMeta(
  { events, calls }: IConfig,
  originalMetadata: Metadata
): Promise<ExtractedModuleMeta[]> {
  const modules: Record<string, PalletMetadataLatest> = {}
  const moduleEvents: Record<string, ExtractedVaraintData[]> = {}
  const moduleCalls: Record<string, ExtractedVaraintData[]> = {}
  const moduleTypes: Record<string, string[]> = {}

  const metadata = originalMetadata.asLatest

  for (const e of events) {
    const [module, event, types] = extractEvent(metadata, e)
    const name = module.name.toString()
    modules[name] = module
    pushToDictionary(moduleEvents, name, event)
    pushToDictionary(moduleTypes, name, ...types)
  }

  for (const c of calls) {
    const [module, call, types] = extractCall(metadata, c)
    const name = module.name.toString()
    modules[name] = module
    pushToDictionary(moduleCalls, name, call)
    pushToDictionary(moduleTypes, name, ...types)
  }

  return Object.keys(modules).map((name) => ({
    module: modules[name],
    events: moduleEvents[name],
    calls: moduleCalls[name],
    types: moduleTypes[name],
  }))
}

function extractCall(
  meta: MetadataLatest,
  callName: string
): [PalletMetadataLatest, ExtractedVaraintData, string[]] {
  const [moduleName, method] = callName.split('.')

  const module = meta.pallets.find((v) => weakEquals(v.name, moduleName))

  if (module === undefined || module.calls === undefined) {
    throw new Error(`No metadata found for module ${moduleName}`)
  }

  let callVariant: Si1Variant | undefined
  if (module.calls.isSome) {
    const lookupId = module.calls.unwrap().type
    const callsType = meta.lookup.getSiType(lookupId)
    callVariant = callsType.def.asVariant.variants.find(
      (v) => v.name.toString() === method
    )
  }

  if (callVariant === undefined) {
    throw new Error(`No metadata found for the call ${callName}`)
  }

  return [
    module,
    extractDataFromVariant(meta, callVariant),
    extractTypesFromVariant(meta, callVariant),
  ]
}

function extractEvent(
  meta: MetadataLatest,
  eventName: string
): [PalletMetadataLatest, ExtractedVaraintData, string[]] {
  const [moduleName, method] = eventName.split('.')

  const module = meta.pallets.find((v) => weakEquals(v.name, moduleName))

  if (module === undefined || module.events === undefined) {
    throw new Error(`No metadata found for module ${moduleName}`)
  }

  let eventVaraint: Si1Variant | undefined
  if (module.events.isSome) {
    const lookupId = module.events.unwrap().type
    const eventsType = meta.lookup.getSiType(lookupId)
    eventVaraint = eventsType.def.asVariant.variants.find(
      (v) => v.name.toString() === method
    )
  }

  if (eventVaraint === undefined) {
    throw new Error(`No metadata found for the event ${eventName}`)
  }

  return [
    module,
    extractDataFromVariant(meta, eventVaraint),
    extractTypesFromVariant(meta, eventVaraint),
  ]
}

export function extractDataFromVariant(
  meta: MetadataLatest,
  varaint: Si1Variant
): ExtractedVaraintData {
  const params = varaint.fields.map(({ type: lookupId, name }) => {
    const t = meta.lookup.getTypeDef(lookupId)
    return {
      type: t.lookupName || t.type,
      name: name.unwrapOr(undefined)?.toString(),
    }
  })
  return {
    params,
    documentation: varaint.docs.map((t) => t.toString()),
    name: varaint.name.toString(),
  }
}

/**
 * Extract all types from Si1Varaint (event / call).
 * Compound types like `Vec<u64>` will also be separated into atomic types (['Vec', 'u64'])
 */
export function extractTypesFromVariant(
  meta: MetadataLatest,
  varaint: Si1Variant
): string[] {
  let types: string[] = []
  const typeDefs = varaint.fields.map(({ type }) =>
    meta.lookup.getTypeDef(type)
  )
  typeDefs.forEach((t) => (types = types.concat(extractTypeDef(meta, t))))
  return uniq(types)
}

/**
 * Extract all types from TypeDef (which is possibly a compound type).
 * This extracts types like `Vec<u64>` into (['Vec', 'u64']) etc.
 */
export function extractTypeDef(meta: MetadataLatest, type: TypeDef): string[] {
  let types: string[] = []
  if (type.lookupName) {
    types.push(type.lookupName)
  } else {
    const parentType = extractParentType(type.type)
    if (parentType) {
      types.push(parentType)
    }
    if (Array.isArray(type.sub)) {
      type.sub.forEach((s) => (types = types.concat(extractTypeDef(meta, s))))
    } else if (type.sub) {
      types = types.concat(extractTypeDef(meta, type.sub))
    }
  }

  types = uniq(types)
  debug('Type:', type)
  debug('Was extracted into:', types)

  return types
}

/**
 * Converts type names like: 'Vec<u8>', 'BTreeMap<u8, u32>' etc. to 'Vec', 'BTreeMap'...
 */
export function extractParentType(typeName: string): string {
  return typeName.startsWith('(')
    ? 'Codec' // for Tuples we just need to import 'Codec'
    : typeName.replace(/[<[].+[>\])]/, '')
}
