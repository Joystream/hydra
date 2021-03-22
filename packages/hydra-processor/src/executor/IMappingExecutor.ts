import { EventContext } from '../queue'

export interface IMappingExecutor {
  init(): Promise<void>
  executeBatch(
    eventCtxs: EventContext[],
    onMappingSuccess: (ctx: EventContext) => Promise<void>
  ): Promise<void>
}
