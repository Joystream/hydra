import pWaitFor from 'p-wait-for'
import { expect } from 'chai'

import { ARRAY_FIELD_QUERY_ANY } from './api/graphql-queries'
import { getGQLClient, getProcessorStatus } from './api/processor-api'

describe('end-to-end arrayfield test', () => {
  before(async () => {
    // wait until the indexer indexes the block and the processor picks it up
    await pWaitFor(
      async () => {
        return (await getProcessorStatus()).lastCompleteBlock > 0
      },
      { interval: 50 }
    )
  })

  it('search array fields', async () => {
    const { systemEvents } = await getGQLClient().request<{
      systemEvents: { id: string }[]
    }>(ARRAY_FIELD_QUERY_ANY)

    expect(systemEvents.length).to.be.equal(1, 'should find one result')
  })
})
