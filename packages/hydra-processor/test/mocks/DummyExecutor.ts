import delay from 'delay'
import { IMappingExecutor } from '.'
import { EventContext } from '../queue'

export class DummyExecutor implements IMappingExecutor {
  private timer = Date.now()
  private total = 0

  async init(): Promise<void> {
    await delay(10)
  }

  async executeBatch(
    eventCtxs: EventContext[],
    onMappingSuccess: (ctx: EventContext) => Promise<void>
  ): Promise<void> {
    await delay(1)
    console.log(`Exectuted ${eventCtxs.length} events`)
    this.total += eventCtxs.length

    const millis = Date.now() - this.timer
    if (this.total > 0)
      console.log(
        `Everage time ms: ${millis / this.total}, total events: ${
          this.total
        }, total ms: ${millis}`
      )
    await onMappingSuccess(eventCtxs[eventCtxs.length - 1])
  }
}
