import {
  SubstrateBlock,
  SubstrateEvent,
  SubstrateExtrinsic,
} from '@dzlzv/hydra-common'
import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { BlockData } from '../queue'
import { MappingHandler } from '../start/manifest'

export interface StoreContext {
  store: DatabaseManager
}

export interface BlockContext {
  block: SubstrateBlock
}

export interface EventContext extends BlockContext {
  event: SubstrateEvent
}

export interface ExtrinsicContext extends BlockContext {
  event: SubstrateEvent
  extrinsic: SubstrateExtrinsic
}

export type MappingContext = BlockContext | EventContext | ExtrinsicContext
// export type BlockHookContext = StoreContext & BlockData

// export type EventContext = StoreContext & MappingContext & BlockData

export type ExecContext = StoreContext & MappingContext

export interface BlockMappings {
  pre: MappingHandler[]
  post: MappingHandler[]
  mappings: MappingHandler[]
}

export interface IMappingsLookup {
  lookupHandlers(ctx: BlockData): BlockMappings

  call(handler: MappingHandler, ctx: ExecContext): Promise<void>
}
