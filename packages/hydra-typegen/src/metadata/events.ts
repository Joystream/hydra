import { IConfig } from '../commands/typegen'
import { registry } from './metadata'
import { uniq, compact } from 'lodash'
import { ExtractedMetadata, Module, ModuleMeta, Event } from './types'

const debug = require('debug')('hydra-typegen:events')

export function extractMeta({ metadata, events }: IConfig): ModuleMeta[] {
  const modules: Record<string, Module> = {}
  const moduleEvents: Record<string, Event[]> = {}
  const moduleTypes: Record<string, string[]> = {}
  events
    .map((e) => findEvent(metadata, e))
    .forEach(([module, event]) => {
      const name = module.name.toString()
      modules[name] = module

      if (!moduleEvents[name]) {
        moduleEvents[name] = []
      }

      moduleEvents[name].push(event)
      if (!moduleTypes[name]) {
        moduleTypes[name] = []
      }
      moduleTypes[name].push(...strippedArgTypes(event))
    })
  return Object.keys(modules).map((name) => ({
    module: modules[name],
    events: moduleEvents[name],
    types: moduleTypes[name],
  }))
}

// function
function findEvent(
  metadata: ExtractedMetadata,
  eventName: string
): [Module, Event] {
  const [moduleName, method] = eventName.split('.')

  const module = metadata.modules.find((v) => v.name.toString() === moduleName)

  if (module === undefined || module.events === undefined) {
    throw new Error(`No metadata found for module ${moduleName}`)
  }

  const event = module.events
    .unwrapOr<Event[]>([])
    .find((e) => e.name.toString() === method)

  if (event === undefined) {
    throw new Error(`No metadata found for event ${eventName}`)
  }

  validateEventTypes(event)

  return [module, event]
}

function validateEventTypes(e: Event) {
  for (const t of strippedArgTypes(e)) {
    if (!registry.hasType(t)) {
      throw new Error(
        `Cannot find a type defintion for ${t}. Make sure it is included in the type definition file`
      )
    }
  }
  debug(`Validated types: ${strippedArgTypes(e).join(',')}`)
}

/**
 * Reduce all argument types to single types, e.g. Compact<Balance> to [Compact, Balance]
 *
 * @param e event
 */
export function strippedArgTypes(e: Event): string[] {
  let types: string[] = []
  e.args.forEach((a) => {
    const type = a.toString().trim()
    if (type.includes('<') || type.includes('&') || type.includes('|')) {
      types.push(...type.split(/[<>\&|]/).map((t) => t.trim()))
    } else {
      types.push(type)
    }
  })
  return compact(uniq(types))
}
