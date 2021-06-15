import pWaitFor from 'p-wait-for'
import { expect } from 'chai'

import { SystemEvent } from './api/types'
import { TYPED_JSONFIELD_FILTERING } from './api/graphql-queries'
import { getGQLClient, getProcessorStatus } from './api/processor-api'

describe('end-to-end jsonfields tests', () => {
  before(async () => {
    // wait until the indexer indexes the block and the processor picks it up
    await pWaitFor(
      async () => {
        return (await getProcessorStatus()).lastCompleteBlock > 0
      },
      { interval: 50 }
    )
  })

  it('fetch typed json types', async () => {
    const { systemEvents } = await getGQLClient().request<{
      systemEvents: SystemEvent[]
    }>(TYPED_JSONFIELD_FILTERING)

    expect(systemEvents.length).to.be.equal(1, 'should find one result')

    const systemEvent = systemEvents[0]

    expect(systemEvent.params.name).to.be.equal(
      'account',
      'should return value of the param name'
    )

    expect(systemEvent.params.arrayData.length).to.be.equal(
      1,
      'should have one element'
    )
  })
})
