import { ExecContext } from '@joystream/hydra-common'
import { BlockData } from '../queue'
import { MappingHandler } from '../start/manifest'

export interface BlockMappings {
  pre: MappingHandler[]
  post: MappingHandler[]
  mappings: MappingHandler[]
}

/**
 * An interface for looking up the right handler for the given data and proving an execution context for it
 */
export interface IMappingsLookup {
  lookupHandlers(ctx: BlockData): BlockMappings

  call(handler: MappingHandler, ctx: ExecContext): Promise<void>
}
