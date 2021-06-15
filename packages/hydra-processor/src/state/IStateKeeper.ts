import { EntityManager } from 'typeorm'

export interface IProcessorState {
  lastProcessedEvent: string
  lastScannedBlock: number
}

/**
 * A processor view of the indexer state, that should be regularly updated
 */
export interface IndexerStatus {
  head: number
  chainHeight: number
  hydraVersion: string
}

/**
 * An interface for accessing the processor state, which is persisted to the database,
 * so that the processor is recoverable after crashes
 */
export interface IStateKeeper {
  updateState(
    newState: Partial<IProcessorState>,
    em?: EntityManager
  ): Promise<void>

  getState(): IProcessorState
  getIndexerStatus(): IndexerStatus
}
