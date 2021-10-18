import expect from 'expect'
import { queryNode, waitForProcessing } from './api/processor'

describe('end-to-end json fields tests', () => {
  before(waitForProcessing)

  it('fetch typed json types', () => {
    return queryNode.test(
      `
      query {
        systemEvents {
          params {
            name
            type
            value
            additionalData {
              data
            }
          }
        }
      }
    `,
      {
        systemEvents: [
          expect.objectContaining({
            params: expect.objectContaining({
              name: 'account',
              additionalData: [expect.anything()],
            }),
          }),
        ],
      }
    )
  })

  it('fetch json list', () => {
    return queryNode.test(
      `
      query {
        eventBs {
          statusList {
            ... on HappyPoor {
              isMale
            }
          }
        }
      }
    `,
      {
        eventBs: [
          {
            statusList: [{ isMale: true }],
          },
        ],
      }
    )
  })
})
