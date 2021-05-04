import { BlockContext } from '../queue'

export interface IMappingExecutor {
  executeBlock(
    blockCtx: BlockContext,
    onSuccess: (ctx: BlockContext) => Promise<void>
  ): Promise<void>
}
