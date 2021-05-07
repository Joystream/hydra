import { EntityManager } from 'typeorm'

export interface IProcessorState {
  lastProcessedEvent: string
  lastScannedBlock: number
}

export interface IndexerStatus {
  head: number
  chainHeight: number
  hydraVersion: string
}

export interface IStateKeeper {
  updateState(
    newState: Partial<IProcessorState>,
    em?: EntityManager
  ): Promise<void>

  getState(): IProcessorState
  getIndexerStatus(): IndexerStatus
}
