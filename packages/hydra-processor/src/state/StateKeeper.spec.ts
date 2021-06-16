import { formatEventId } from '@joystream/hydra-common'
import { expect } from 'chai'
import { initState } from './StateKeeper'

const zeroEvent = formatEventId(0, 0)

describe('StateKeeper', () => {
  it('should properly set the initial state', () => {
    let state = initState({ from: 0, to: 3333 }, undefined)
    expect(state.lastScannedBlock).equals(
      -1,
      'should set last scanned block to -1 by default'
    )
    expect(state.lastProcessedEvent).equals(zeroEvent)

    state = initState(
      { from: 34, to: Number.POSITIVE_INFINITY },
      {
        lastScannedBlock: 30,
        eventId: zeroEvent,
      }
    )
    expect(state.lastScannedBlock).equals(
      33,
      'should take the left range when the last block is below'
    )

    state = initState(
      { from: 34, to: Number.POSITIVE_INFINITY },
      {
        lastScannedBlock: 40,
        eventId: zeroEvent,
      }
    )
    expect(state.lastScannedBlock).equals(
      40,
      'should take the saved state when the last scanned block is within the range'
    )

    expect(
      () =>
        (state = initState(
          { from: 34, to: 40 },
          {
            lastScannedBlock: 39,
            eventId: zeroEvent,
          }
        ))
    ).not.to.throw('beyond')

    expect(
      () =>
        (state = initState(
          { from: 34, to: 40 },
          {
            lastScannedBlock: 40,
            eventId: zeroEvent,
          }
        ))
    ).to.throw('beyond')
  })
})
