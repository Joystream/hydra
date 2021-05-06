import { BlockQueue } from './BlockQueue'
import { expect } from 'chai'
import { RangeFilter, MappingFilter } from './IBlockQueue'
import { IndexerStatus, IProcessorState, IStateKeeper } from '../state'
import { formatEventId } from '@dzlzv/hydra-common'
import { getConfig as conf } from '../start/config'

describe('EventQueue', () => {
  it('should properly set the initial filter', () => {
    const eventQueue: BlockQueue = new BlockQueue()
    eventQueue.stateKeeper = ({
      getState: () => {
        return {
          lastScannedBlock: 1000,
          lastProcessedEvent: formatEventId(0, 5),
        } as IProcessorState
      },
    } as unknown) as IStateKeeper

    eventQueue.indexerStatus = ({ head: 10000 } as unknown) as IndexerStatus
    eventQueue.mappingFilter = ({
      events: [],
      extrinsics: [],
      range: {
        to: 150000,
      },
    } as unknown) as MappingFilter

    const initFilter = eventQueue.getInitialRange()

    expect(initFilter.block.gt).equals(
      1000,
      'should set the lower block limit to last scanned block'
    )
    expect(initFilter.block.lte).equals(
      Math.min(10000, 1000 + conf().BLOCK_WINDOW),
      'should set the upper block limit the current indexer head'
    )
  })

  it('should update the next block range', () => {
    const eventQueue: BlockQueue = new BlockQueue()

    eventQueue.rangeFilter = ({
      block: {
        gt: 0,
        lte: 100000,
      },
    } as unknown) as RangeFilter

    eventQueue.mappingFilter = ({
      range: {
        to: 150000,
      },
    } as unknown) as MappingFilter

    eventQueue.indexerStatus = ({ head: 500000 } as unknown) as IndexerStatus

    const next = eventQueue.nextBlockRange(eventQueue.rangeFilter.block)
    expect(next.gt).equals(100000, 'should update the lower block limit')
    expect(next.lte).equals(
      150000,
      'should respect the upper limit of the global filter'
    )
  })
})
