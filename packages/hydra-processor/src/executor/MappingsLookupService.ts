/* eslint-disable @typescript-eslint/no-explicit-any  */
import Debug from 'debug'
import { compact } from 'lodash'
import {
  EventHandler,
  ExtrinsicHandler,
  MappingHandler,
  MappingsDef,
  Filter,
} from '../start/manifest'

import { BlockData, EventData, Kind } from '../queue'
import { getConfig as conf } from '../start/config'
import { isInRange } from '../util'
import {
  MappingContext,
  EventContext,
  ExtrinsicContext,
  ExecContext,
} from '@dzlzv/hydra-common'
import { IMappingsLookup, BlockMappings } from './IMappingsLookup'
const debug = Debug('hydra-processor:handler-lookup-service')

// export function isBlockHookContext(
//   context: ExecContext
// ): context is BlockHookContext {
//   return (context as any).eventCtxs !== undefined
// }

export function isEventOrExtrinsicContext(
  context: MappingContext
): context is EventContext | ExtrinsicContext {
  return (context as any).event !== undefined
}

// export function extractBlock(
//   context: MappingContext
// ): { blockNumber: number; blockTimestamp: number } {
//   // TODO: extract block
//   return context.event
// }

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
      debug(
        `Lookup handlers, block context: ${JSON.stringify(blockData, null, 2)}`
      )

    const filtered = {
      pre: filter(this.mappings.preBlockHooks || [], blockData),
      post: filter(this.mappings.postBlockHooks || [], blockData),
      mappings: compact(
        blockData.events.map((eventData) =>
          this.lookupMapping(eventData, blockData)
        )
      ),
    }

    if (conf().VERBOSE)
      debug(`Mappings for the block: ${JSON.stringify(filtered, null, 2)}`)

    return filtered
  }

  lookupMapping(
    eventData: EventData,
    blockData: BlockData
  ): MappingHandler | undefined {
    const name = normalize(extractName(eventData))
    const mappings: MappingHandler[] =
      eventData.kind === Kind.EVENT ? this.events[name] : this.extrinsics[name]

    const inRange = filter(mappings, blockData)

    if (inRange.length === 1) return inRange[0]

    if (inRange.length > 1) {
      throw new Error(
        `Multiple mappings match ${name} for block ${blockData.block.id} with no ordering defined`
      )
    }

    debug(`Cannot find a handler for ${name} and block ${blockData.block.id}`)

    if (conf().VERBOSE) debug(`Context: ${JSON.stringify(blockData, null, 2)}`)
  }

  async call(handler: MappingHandler, ctx: ExecContext): Promise<void> {
    const { handler: handlerFunc } = handler

    if (isEventOrExtrinsicContext(ctx) && handler.types.length > 0) {
      // legacy mappings with positional arguments
      const args = handler.types.map((t) =>
        resolveType(ctx, t, this.resolvedImports)
      )
      await handlerFunc(...args)
      return
    }

    await handlerFunc(...[ctx])
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
    if (!isEventOrExtrinsicContext(ctx)) {
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

  if (!isEventOrExtrinsicContext(ctx)) {
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

export function extractName(ctx: EventData): string {
  if (ctx.kind === Kind.EVENT) return ctx.event.name
  if (ctx.kind === Kind.EXTRINSIC) {
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

export function filter<T extends { filter?: Filter }>(
  mappings: T[],
  blockData: BlockData
): T[] {
  return mappings.filter((m) => matches(m, blockData))
}

export function matches<T extends { filter?: Filter }>(
  mapping: T,
  blockData: BlockData
): boolean {
  if (mapping.filter === undefined) {
    return true
  }

  if (
    mapping.filter.height &&
    !isInRange(blockData.block.height, mapping.filter.height)
  ) {
    return false
  }

  if (
    mapping.filter.specVersion &&
    blockData.block.runtimeVersion.specVersion &&
    !isInRange(
      blockData.block.runtimeVersion.specVersion as number,
      mapping.filter.specVersion
    )
  ) {
    return false
  }

  return true
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
