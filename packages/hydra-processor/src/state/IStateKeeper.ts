import { EntityManager } from 'typeorm'

export interface IProcessorState {
  lastProcessedEvent: string
  lastScannedBlock: number
}

export interface IndexerStatus {
  head: number
  chainHeight: number
}

export interface IStateKeeper {
  updateState(
    newState: Partial<IProcessorState>,
    em?: EntityManager
  ): Promise<void>

  init(blockInterval?: { from: number }): Promise<IProcessorState>

  getState(): IProcessorState
  getIndexerStatus(): IndexerStatus
}
