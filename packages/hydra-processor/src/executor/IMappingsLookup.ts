import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { BlockContext, MappingContext } from '../queue'
import { MappingHandler } from '../start/manifest'

export interface StoreContext {
  store: DatabaseManager
}

export type BlockHookContext = StoreContext & BlockContext

export type EventContext = StoreContext & MappingContext

export type ExecContext = BlockHookContext | EventContext

export interface BlockMappings {
  pre: MappingHandler[]
  post: MappingHandler[]
  mappings: MappingHandler[]
}

export interface IMappingsLookup {
  lookupHandlers(ctx: BlockContext): BlockMappings

  call(handler: MappingHandler, ctx: ExecContext): Promise<void>
}
