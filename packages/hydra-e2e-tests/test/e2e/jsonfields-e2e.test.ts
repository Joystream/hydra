import { expect } from 'chai'
import { SystemEvent } from './api/types'
import { TYPED_JSONFIELD_FILTERING } from './api/graphql-queries'
import { getGQLClient, waitForProcessing } from './api/processor-api'

describe('end-to-end jsonfields tests', () => {
  before(() => waitForProcessing())

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

    expect(systemEvent.params.additionalData.length).to.be.equal(
      1,
      'should have one element'
    )
  })
})
