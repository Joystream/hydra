import { BlockData } from '../queue'

export interface IMappingExecutor {
  executeBlock(
    blockCtx: BlockData,
    onSuccess: (ctx: BlockData) => Promise<void>
  ): Promise<void>
}
