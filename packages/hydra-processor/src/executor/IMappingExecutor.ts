import { EventContext } from '../queue'

export interface IMappingExecutor {
  executeBatch(
    eventCtxs: EventContext[],
    onMappingSuccess: (ctx: EventContext) => Promise<void>
  ): Promise<void>
}
