/* eslint-disable @typescript-eslint/no-explicit-any  */
import Debug from 'debug'
import { getManifest } from '../start/config'
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import {
  CONTEXT_CLASS_NAME,
  MappingHandler,
  STORE_CLASS_NAME,
} from '../start/manifest'

const debug = Debug('hydra-processor:handler-lookup-service')

const EXTRINSIC_EVENTS = ['system.ExtrinsicSuccess']

export class HandlerLookupService {
  private events: string[]

  private argFactory: Record<string, (args: GlobalArgs) => unknown> = {}

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

    this.argFactory[CONTEXT_CLASS_NAME] = ({ context }: GlobalArgs) => context
    this.argFactory[STORE_CLASS_NAME] = ({ dbStore }: GlobalArgs) => dbStore
  }

  async load(): Promise<void> {
    const resolvedImports = await resolveImports(this.mappings.imports)

    const handlers = [
      ...Object.values(this.mappings.eventHandlers),
      ...Object.values(this.mappings.extrinsicHandlers),
    ]

    handlers.forEach((h) => {
      h.argTypes.forEach((argType) => {
        if (!this.argFactory[argType]) {
          const proto = resolveArgType(argType, resolvedImports).prototype

          this.argFactory[argType] = ({ context }: GlobalArgs) => {
            const instance = Object.create(proto)
            return new instance.constructor(context)
          }
        }
      })
    })
  }

  eventsToHandle(): string[] {
    return this.events
  }

  async lookupAndCall(ctxArgs: GlobalArgs): Promise<void> {
    const { handlerFunc, argTypes } = this.lookupHander(ctxArgs)

    const args = argTypes
      ? argTypes.map((a) => this.argFactory[a](ctxArgs))
      : []

    await handlerFunc(...args)
  }

  lookupHander({ context }: GlobalArgs): MappingHandler {
    let handler = undefined
    if (EXTRINSIC_EVENTS.includes(context.name)) {
      if (context.extrinsic === undefined) {
        throw new Error(
          `No extrinsics found in the context ${JSON.stringify(
            context,
            null,
            2
          )}`
        )
      }
      const extrinsicName = `${context.extrinsic.section}.${context.extrinsic.method}`
      handler = this.mappings.extrinsicHandlers[extrinsicName]
    } else {
      handler = this.mappings.eventHandlers[context.name]
    }

    if (handler === undefined) {
      throw new Error(
        `Cannot find a handler for the execution context ${JSON.stringify(
          context,
          null,
          2
        )}`
      )
    }
    return handler
  }
}

export interface HandlerContext {
  globals: GlobalArgs
}

export interface GlobalArgs {
  dbStore: DatabaseManager
  context: SubstrateEvent
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
