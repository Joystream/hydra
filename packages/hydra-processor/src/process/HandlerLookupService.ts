/* eslint-disable @typescript-eslint/no-explicit-any  */
import Debug from 'debug'
import { getManifest } from '../start/config'
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { CONTEXT_CLASS_NAME, STORE_CLASS_NAME } from '../start/manifest'

const debug = Debug('hydra-processor:handler-lookup-service')

export class HandlerLookupService {
  private events: string[]
  private prototypes: Record<string, any> = {}

  constructor(protected mappings = getManifest().mappings) {
    this.events = Object.keys(this.mappings.eventHandlers)

    debug(
      `The following events will be processed: ${JSON.stringify(
        this.events,
        null,
        2
      )}`
    )

    debug(
      `The following extrinsics will be processed: ${JSON.stringify(
        Object.keys(this.mappings.extrinsicHandlers),
        null,
        2
      )}`
    )
  }

  async load(): Promise<void> {
    const resolvedImports = await resolveImports(this.mappings.imports)

    Object.values(this.mappings.eventHandlers).forEach((h) => {
      h.argTypes.forEach((argType) => {
        if (![CONTEXT_CLASS_NAME, STORE_CLASS_NAME].includes(argType)) {
          this.prototypes[argType] = resolveArgType(
            argType,
            resolvedImports
          ).prototype
        }
      })
    })
  }

  eventsToHandle(): string[] {
    return this.events
  }

  async lookupAndCall(ctxArgs: ContextArgs): Promise<void> {
    const { context } = ctxArgs
    if (!(context.name in this.mappings.eventHandlers)) {
      throw new Error(`No mapping is defined for ${context.name}`)
    }

    const { handlerFunc, argTypes } = this.mappings.eventHandlers[context.name]

    const args = createArgs(argTypes, ctxArgs, this.prototypes)

    await handlerFunc(...args)
  }
}

export interface ContextArgs {
  dbStore: DatabaseManager
  context: SubstrateEvent
}

export function createArgs(
  argTypes: string[],
  { dbStore, context }: ContextArgs,
  prototypes: Record<string, any>
): any[] {
  return argTypes.map((argType) => {
    if (argType === CONTEXT_CLASS_NAME) {
      return context
    }
    if (argType === STORE_CLASS_NAME) {
      return dbStore
    }
    const instance = Object.create(prototypes[argType])
    return new instance.constructor(context)
  })
}

export async function resolveImports(
  imports: string[]
): Promise<Record<string, unknown>> {
  let resolved = {}
  for (const importPath of imports) {
    const resolvedImport = await import(importPath)
    resolved = {
      ...resolvedImport,
      ...resolved,
    }
  }
  return resolved as Record<string, unknown>
}

export function resolveArgType(
  argType: string,
  imports: Record<string, unknown>
): any {
  const modules = argType.split('.').map((s) => s.trim())

  let obj = imports

  for (const module of modules) {
    obj = obj[module] as Record<string, unknown>
    if (obj === undefined) {
      throw new Error(`Cannot load type ${argType}:${module}`)
    }
  }
  return obj
}
