import { ExecContext } from '@subsquid/hydra-common'
import { BlockData } from '../queue'
import { MappingHandler } from '../start/manifest'

export interface BlockMappings {
  pre: MappingHandler[]
  post: MappingHandler[]
  mappings: MappingHandler[]
}

export interface IMappingsLookup {
  lookupHandlers(ctx: BlockData): BlockMappings

  call(handler: MappingHandler, ctx: ExecContext): Promise<void>
}
