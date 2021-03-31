/* eslint-disable @typescript-eslint/no-explicit-any  */
import Debug from 'debug'
import {
  BlockRange,
  EventHandler,
  ExtrinsicHandler,
  MappingHandler,
  MappingsDef,
} from '../start/manifest'
import {
  BlockHookContext,
  BlockMappings,
  ExecContext,
  IMappingsLookup,
  EventContext,
} from './IMappingsLookup'
import { BlockContext, MappingContext, MappingType } from '../queue'
import BN from 'BN.js'
import pImmediate from 'p-immediate'
import { conf } from '../start/config'

const debug = Debug('hydra-processor:handler-lookup-service')

export function isBlockHookContext(
  context: ExecContext
): context is BlockHookContext {
  return (context as any).eventCtxs !== undefined
}

export function isEventContext(context: ExecContext): context is EventContext {
  return (context as any).event !== undefined
}

export function extractBlock(
  context: MappingContext
): { blockNumber: number; blockTimestamp: BN } {
  // TODO: extract block
  return context.event
}

export class MappingsLookupService implements IMappingsLookup {
  private events: string[]

  constructor(protected mappings: MappingsDef) {
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

    debug(`Pre-hooks: ${JSON.stringify(this.mappings.preBlockHooks)}`)
    debug(`Post-hooks: ${JSON.stringify(this.mappings.postBlockHooks)}`)
  }

  lookupHandlers(ctx: BlockContext): BlockMappings {
    if (conf.VERBOSE)
      debug(`Lookup handlers, block context: ${JSON.stringify(ctx, null, 2)}`)
    // in the future here we can do much more complex lookups here, e.g. based
    // on the block height or runtime metadata of the current block
    const { blockNumber } = ctx
    const filter = (mappings: MappingHandler[]) =>
      mappings.filter((m) => isInInterval(blockNumber, m.range))

    const filtered = {
      pre: filter(this.mappings.preBlockHooks || []),
      post: filter(this.mappings.postBlockHooks || []),
      mappings: filter(ctx.eventCtxs.map((ctx) => this.lookupMapping(ctx))),
    }

    if (conf.VERBOSE)
      debug(`Mappings for the block: ${JSON.stringify(filtered, null, 2)}`)

    return filtered
  }

  lookupMapping(ctx: MappingContext): EventHandler | ExtrinsicHandler {
    if (ctx.type === MappingType.EVENT) {
      // TODO: optimize
      return this.mappings.eventHandlers.find(
        (h) => h.event === ctx.event.name
      ) as EventHandler
    }
    if (ctx.type === MappingType.EXTRINSIC) {
      const extrinsic = ctx.event.extrinsic
      if (extrinsic === undefined) {
        throw new Error(
          `No extrinsics found in the context ${JSON.stringify(ctx, null, 2)}`
        )
      }
      const extrinsicName = `${extrinsic.section}.${extrinsic.method}`
      return this.mappings.extrinsicHandlers.find(
        (h) => h.extrinsic === extrinsicName
      ) as ExtrinsicHandler
    }
    throw new Error(
      `Cannot find a handler for the execution context ${JSON.stringify(
        ctx,
        null,
        2
      )}`
    )
  }

  async call(handler: MappingHandler, ctx: ExecContext): Promise<void> {
    const { handler: handlerFunc } = handler

    // TODO: these should be replaced with casts to hydra-common interfaces
    const arg = isBlockHookContext(ctx)
      ? { block: ctx }
      : {
          ...ctx,
          block: extractBlock(ctx as MappingContext),
          extrinsic: ctx.event.extrinsic,
        }

    await handlerFunc(...[arg])
  }

  async load(): Promise<void> {
    // do nothing for now
    await pImmediate()
  }
}

export function isInInterval(
  blockNumber: number,
  interval: BlockRange | undefined
): boolean {
  if (interval === undefined) {
    return true
  }
  const { from, to } = interval
  const notInRange = (from && from > blockNumber) || (to && to <= blockNumber)
  return !notInRange
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
      throw new Error(`Cannot load type ${argType}: ${module} is undefined`)
    }
  }
  return obj
}
