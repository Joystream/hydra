import { queryNode, waitForProcessing } from './api/processor'

describe('one-to-one lookups test', function () {
  before(waitForProcessing)

  it('fetches lookups correctly', function () {
    return queryNode.test(
      `
      query {
        issues(orderBy: id_ASC) {
          id
          payment {
            amount
          }
          cancellation {
            block
          }
        }
      }
    `,
      {
        issues: [
          {
            id: '1',
            payment: {
              amount: 10,
            },
            cancellation: null,
          },
          {
            id: '2',
            payment: null,
            cancellation: {
              block: 100,
            },
          },
        ],
      }
    )
  })
})
