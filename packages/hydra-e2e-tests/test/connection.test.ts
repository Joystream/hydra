import { queryNode, waitForProcessing } from './api/processor'

describe('connections', () => {
  before(() => waitForProcessing(1))

  it('handles .totalCount query with where condition on relation', () => {
    return queryNode.test(
      `
      query {
        connection: blockHooksConnection(
          orderBy: blockNumber_ASC
          where: { timestamp: { timestamp_gt: "0" } }
        ) {
          totalCount
        }
      }
    `,
      {
        connection: {
          totalCount: 2,
        },
      }
    )
  })
})
