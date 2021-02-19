import { IProcessorState } from './IProcessorState'
import { EntityManager } from 'typeorm'
import { IndexerStatus } from '../ingest'

export interface IProcessorStateHandler {
  persist(
    state: IProcessorState,
    indexerStatus: IndexerStatus,
    em?: EntityManager
  ): Promise<void>
  init(blockInterval?: { from: number }): Promise<IProcessorState>
  /**
   * Explicity expose 'on' method from EventEmitter to ensure listeners can listen to events
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // on(event: string | symbol, listener: (...args: any[]) => void): this
}
