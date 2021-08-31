import { expect } from 'chai'
import { ARRAY_FIELD_QUERY_ANY } from './api/graphql-queries'
import { getGQLClient, waitForProcessing } from './api/processor-api'

describe('end-to-end arrayfield test', () => {
  before(() => waitForProcessing())

  it('search array fields', async () => {
    const { systemEvents } = await getGQLClient().request<{
      systemEvents: { id: string }[]
    }>(ARRAY_FIELD_QUERY_ANY)

    expect(systemEvents.length).to.be.equal(1, 'should find one result')
  })
})
