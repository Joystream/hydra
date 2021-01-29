import { IConfig } from '../commands/typegen'
import { getMetadata, registry } from './metadata'
import { uniq, compact } from 'lodash'
import { Vec } from '@polkadot/types/codec'
import { Text } from '@polkadot/types/primitive'
import {
  ExtractedMetadata,
  Module,
  ModuleMeta,
  Event,
  Call,
  weakEquals,
} from './types'
import { pushToDictionary } from '../util'
import { builtInClasses } from './default-types'

const debug = require('debug')('hydra-typegen:extract')

export async function extractMeta({
  metadata: metadataSource,
  events,
  calls,
}: IConfig): Promise<ModuleMeta[]> {
  const modules: Record<string, Module> = {}
  const moduleEvents: Record<string, Event[]> = {}
  const moduleCalls: Record<string, Call[]> = {}
  const moduleTypes: Record<string, string[]> = {}

  const metadata = await getMetadata(metadataSource)

  for (const e of events) {
    const [module, event] = findEvent(metadata, e)
    const name = module.name.toString()
    modules[name] = module
    pushToDictionary(moduleEvents, name, event)
    pushToDictionary(moduleTypes, name, ...stripTypes(event.args))
  }

  for (const c of calls) {
    const [module, call] = findCall(metadata, c)
    const name = module.name.toString()
    modules[name] = module
    pushToDictionary(moduleCalls, name, call)
    pushToDictionary(
      moduleTypes,
      name,
      ...stripTypes(call.args.map((a) => a.type.toString()))
    )
  }

  return Object.keys(modules).map((name) => ({
    module: modules[name],
    events: moduleEvents[name],
    calls: moduleCalls[name],
    types: moduleTypes[name],
  }))
}

function findCall(
  metadata: ExtractedMetadata,
  callName: string
): [Module, Call] {
  const [moduleName, method] = callName.split('.')

  const module = metadata.modules.find((v) => weakEquals(v.name, moduleName))

  if (module === undefined || module.calls === undefined) {
    throw new Error(`No metadata found for module ${moduleName}`)
  }

  const call = module.calls
    .unwrapOr<Call[]>([])
    .find((c) => weakEquals(c.name, method))

  if (call === undefined) {
    throw new Error(`No metadata found for the call ${callName}`)
  }

  validateTypes(call.args.map((arg) => arg.type))

  return [module, call]
}

function findEvent(
  metadata: ExtractedMetadata,
  eventName: string
): [Module, Event] {
  const [moduleName, method] = eventName.split('.')

  const module = metadata.modules.find((v) => weakEquals(v.name, moduleName))

  if (module === undefined || module.events === undefined) {
    throw new Error(`No metadata found for module ${moduleName}`)
  }

  const event = module.events
    .unwrapOr<Event[]>([])
    .find((e) => weakEquals(e.name, method))

  if (event === undefined) {
    throw new Error(`No metadata found for the event ${eventName}`)
  }

  validateTypes(event.args)

  return [module, event]
}

function validateTypes(argTypes: string[] | Text[] | Vec<Text>) {
  const stripped = stripTypes(argTypes)
  for (const t of stripped) {
    if (!builtInClasses.includes(t) && !registry.hasType(t)) {
      throw new Error(
        `Cannot find a type defintion for ${t}. Make sure it is included in the type definition file`
      )
    }
  }
  debug(`Validated types: ${stripTypes(argTypes).join(',')}`)
}

/**
 * Reduce all argument types to single types, e.g. Compact<Balance> to [Compact, Balance]
 *
 * @param e event
 */
export function stripTypes(argTypes: string[] | Text[] | Vec<Text>): string[] {
  const types: string[] = []
  argTypes.forEach((a: string | Text) => {
    const type = a.toString().trim()
    if (type.includes('<') || type.includes('&') || type.includes('|')) {
      types.push(...type.split(/[<>&|]/).map((t) => t.trim()))
    } else {
      types.push(type)
    }
  })
  return compact(uniq(types))
}
