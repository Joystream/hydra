import { BlockData } from '../queue'

/**
 * An interfaces responsible for processing a block with mappable events
 */
export interface IMappingExecutor {
  executeBlock(
    blockCtx: BlockData,
    onSuccess: (ctx: BlockData) => Promise<void>
  ): Promise<void>
}
