import { expect } from 'chai'
import { gql } from 'graphql-request'
import { getGQLClient, waitForProcessing } from './api/processor-api'

describe('connections', () => {
  before(() => waitForProcessing(1))

  it('handles .totalCount query with where condition on relation', async () => {
    const response = await getGQLClient().request(gql`
      query {
        connection: blockHooksConnection(
          where: { timestamp: { timestamp_gt: "0" } }
        ) {
          totalCount
        }
      }
    `)
    expect(response)
      .to.have.property('connection')
      .to.have.property('totalCount')
      .greaterThan(0)
  })
})
