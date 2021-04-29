/* eslint-disable @typescript-eslint/no-explicit-any  */
import Debug from 'debug'
import { compact } from 'lodash'
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
import { BlockData, MappingContext, HandlerKind } from '../queue'
import { getConfig as conf } from '../start/config'
import { isInRange } from '../util/utils'

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
): { blockNumber: number; blockTimestamp: number } {
  // TODO: extract block
  return context.event
}

export class MappingsLookupService implements IMappingsLookup {
  private events: Record<string, EventHandler[]> = {}
  private extrinsics: Record<string, ExtrinsicHandler[]> = {}
  private resolvedImports!: Record<string, unknown>

  constructor(protected mappings: MappingsDef) {
    this.mappings.eventHandlers.map((h) => {
      const name = normalize(h.event)
      this.events[name] ? this.events[name].push(h) : (this.events[name] = [h])
    })

    debug(
      `The following events will be processed: ${JSON.stringify(
        Object.keys(this.events),
        null,
        2
      )}`
    )

    this.mappings.extrinsicHandlers.map((h) => {
      const name = normalize(h.extrinsic)
      this.extrinsics[name]
        ? this.extrinsics[name].push(h)
        : (this.extrinsics[name] = [h])
    })

    debug(
      `The following extrinsics will be processed: ${JSON.stringify(
        Object.keys(this.extrinsics),
        null,
        2
      )}`
    )

    debug(`Pre-hooks: ${JSON.stringify(this.mappings.preBlockHooks)}`)
    debug(`Post-hooks: ${JSON.stringify(this.mappings.postBlockHooks)}`)
  }

  lookupHandlers(blockData: BlockData): BlockMappings {
    if (conf().VERBOSE)
      debug(`Lookup handlers, block context: ${JSON.stringify(blockData, null, 2)}`)
    // in the future here we can do much more complex lookups here, e.g. based
    // on the block height or runtime metadata of the current block
    const {
      block: { height },
    } = blockData

    const filtered = {
      pre: rangeFilter(this.mappings.preBlockHooks || [], height),
      post: rangeFilter(this.mappings.postBlockHooks || [], height),
      mappings: compact(
        blockData.events.map((ctx) => this.lookupMapping(ctx, height))
      ),
    }

    if (conf().VERBOSE)
      debug(`Mappings for the block: ${JSON.stringify(filtered, null, 2)}`)

    return filtered
  }

  lookupMapping(
    ctx: MappingContext,
    blockNumber: number
  ): MappingHandler | undefined {
    const name = normalize(extractName(ctx))
    const mappings: MappingHandler[] =
      ctx.kind === HandlerKind.EVENT ? this.events[name] : this.extrinsics[name]

    const inRange = rangeFilter(mappings, blockNumber)

    if (inRange.length === 1) return inRange[0]

    if (inRange.length > 1) {
      throw new Error(
        `Multiple mappings match ${name} for block height ${blockNumber} with no ordering defined`
      )
    }

    debug(`Cannot find a handler for ${name} and block ${blockNumber}`)

    if (conf().VERBOSE) debug(`Context: ${JSON.stringify(ctx, null, 2)}`)
  }

  async call(handler: MappingHandler, ctx: ExecContext): Promise<void> {
    const { handler: handlerFunc } = handler

    // TODO: these should be replaced with casts to hydra-common interfaces
    let ctxArg = { ...ctx } as ExecContext
    const extra = isBlockHookContext(ctx)
      ? { block: ctx }
      : {
          block: extractBlock(ctx as MappingContext),
          extrinsic: ctx.event.extrinsic,
        }
    ctxArg = { ...extra, ...ctxArg }

    if (handler.types.length > 0) {
      const args = handler.types.map((t) =>
        resolveType(ctxArg, t, this.resolvedImports)
      )
      await handlerFunc(...args)
      return
    }

    await handlerFunc(...[ctxArg])
  }

  async load(): Promise<void> {
    this.resolvedImports = await resolveImports(this.mappings.imports)
  }
}

export function resolveType(
  ctx: ExecContext,
  type: string,
  resolvedImports: Record<string, unknown>
): unknown {
  if (type === 'DatabaseManager') {
    return ctx.store
  }
  if (type === 'SubstrateEvent') {
    if (!isEventContext(ctx)) {
      throw new Error(
        `Cannot extract SubstrateEvent from the context ${JSON.stringify(
          ctx,
          null,
          2
        )}`
      )
    }
    return ctx.event
  }

  if (type === 'ExecContext') {
    return ctx
  }

  if (!isEventContext(ctx)) {
    throw new Error(
      `Cannot construct an argument of type ${type} from the context ${JSON.stringify(
        ctx,
        null,
        2
      )}`
    )
  }

  const proto = resolveArgType(type, resolvedImports).prototype
  const instance = Object.create(proto)

  return new instance.constructor(ctx.event)
}

// used to normalize event and extrinsic names for consistent lookups
export const normalize = (s: string): string => s.trim().toLowerCase()

export function extractName(ctx: MappingContext): string {
  if (ctx.kind === HandlerKind.EVENT) return ctx.event.name
  if (ctx.kind === HandlerKind.EXTRINSIC) {
    const extrinsic = ctx.event.extrinsic
    if (extrinsic === undefined) {
      throw new Error(
        `No extrinsics found in the context ${JSON.stringify(ctx, null, 2)}`
      )
    }
    return `${extrinsic.section}.${extrinsic.method}`
  }
  throw new Error(`Mapping type does not support name`)
}

export function rangeFilter<T extends { range?: BlockRange }>(
  mappings: T[],
  blockNumber: number
): T[] {
  return mappings.filter((m) => isInRange(blockNumber, m.range))
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
