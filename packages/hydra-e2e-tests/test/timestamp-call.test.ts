import expect from 'expect'
import { queryNode, waitForProcessing } from './api/processor'

describe('End-to-end timestamp call tests', () => {
  before(() => waitForProcessing(1))

  it('updates the blockstamp table', () => {
    return queryNode.test(
      `
      query {
        blockTimestamps(limit: 1, orderBy: blockNumber_DESC) {
          timestamp
        }
      }
    `,
      {
        blockTimestamps: [
          {
            timestamp: expect.stringMatching(/^\d+$/),
          },
        ],
      }
    )
  })
})
