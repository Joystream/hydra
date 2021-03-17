import { EntityManager } from 'typeorm'
import { IndexerStatus } from '../ingest'
import { SubstrateEvent } from '@dzlzv/hydra-common'
import { IProcessorState } from '../process'

export interface EventBatchExecution {
  state: IProcessorState
  batchFilters: { block_lte: number }[]
}

export interface EventExecution {
  event: SubstrateEvent
  state: IProcessorState
  em: EntityManager
}

export interface IProcessorStateKeeper {
  // persist(
  //   state: IProcessorState,
  //   indexerStatus: IndexerStatus,
  //   em?: EntityManager
  // ): Promise<void>

  init(blockInterval?: { from: number }): Promise<IProcessorState>

  eventBatchComplete(ctx: EventBatchExecution): Promise<IProcessorState>
  eventSuccess(ctx: EventExecution): Promise<IProcessorState>
  //eventBatchComplete(state: IProcessorState, )
}
