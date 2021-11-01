import { ExecContext } from '@subsquid/hydra-common'
import { BlockData, EventData } from '../queue'
import { MappingHandler } from '../start/manifest'

export interface BlockMappings {
  pre: MappingHandler[]
  post: MappingHandler[]
}

export interface IMappingsLookup {
  lookupBlockHandlers(ctx: BlockData): BlockMappings
  lookupEventHandler(
    eventData: EventData,
    blockData: BlockData
  ): MappingHandler | undefined
  call(handler: MappingHandler, ctx: ExecContext): Promise<void>
}
