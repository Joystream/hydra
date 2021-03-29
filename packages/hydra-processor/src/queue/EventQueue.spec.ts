import { EventQueue } from './EventQueue'
import { expect } from 'chai'
import { FilterConfig, MappingFilter } from './IEventQueue'
import { IndexerStatus, IProcessorState, IStateKeeper } from '../state'
import { formatEventId } from '@dzlzv/hydra-common'
import { conf } from '../start/config'

describe('EventQueue', () => {
  it('should properly set the initial filter', () => {
    const eventQueue: EventQueue = new EventQueue()
    eventQueue.stateKeeper = ({
      getState: () => {
        return {
          lastScannedBlock: 1000,
          lastProcessedEvent: formatEventId(0, 5),
        } as IProcessorState
      },
    } as unknown) as IStateKeeper

    eventQueue.indexerStatus = ({ head: 10000 } as unknown) as IndexerStatus
    eventQueue.globalFilter = ({
      events: [],
      extrinsics: [],
      blockInterval: {
        to: 150000,
      },
    } as unknown) as MappingFilter

    const initFilter = eventQueue.getInitialFilter()

    expect(initFilter.block.gt).equals(
      1000,
      'should set the lower block limit to last scanned block'
    )
    expect(initFilter.block.lte).equals(
      Math.min(10000, 1000 + conf.BLOCK_WINDOW),
      'should set the upper block limit the current indexer head'
    )
  })

  it('should update the next block range', () => {
    const eventQueue: EventQueue = new EventQueue()

    eventQueue.currentFilter = ({
      block: {
        gt: 0,
        lte: 100000,
      },
    } as unknown) as FilterConfig

    eventQueue.globalFilter = ({
      blockInterval: {
        to: 150000,
      },
    } as unknown) as MappingFilter

    eventQueue.indexerStatus = ({ head: 500000 } as unknown) as IndexerStatus

    const next = eventQueue.nextBlockRange(eventQueue.currentFilter.block)
    expect(next.gt).equals(100000, 'should update the lower block limit')
    expect(next.lte).equals(
      150000,
      'should respect the upper limit of the global filter'
    )
  })
})
