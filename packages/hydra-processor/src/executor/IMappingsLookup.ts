import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { BlockData, MappingContext } from '../queue'
import { MappingHandler } from '../start/manifest'

export interface StoreContext {
  store: DatabaseManager
}

export type BlockHookContext = StoreContext & BlockData

export type EventContext = StoreContext & MappingContext

export type ExecContext = BlockHookContext | EventContext

export interface BlockMappings {
  pre: MappingHandler[]
  post: MappingHandler[]
  mappings: MappingHandler[]
}

export interface IMappingsLookup {
  lookupHandlers(ctx: BlockData): BlockMappings

  call(handler: MappingHandler, ctx: ExecContext): Promise<void>
}
