import expect from 'expect'
import { queryNode, waitForProcessing } from './api/processor'

describe('end-to-end array field test', () => {
  before(() => waitForProcessing())

  it('search array fields', () => {
    return queryNode.test(
      `
      query {
        systemEvents(where: { arrayField_containsAny: ["aaa"] }) {
          id
        }
      }
    `,
      {
        systemEvents: [expect.anything()],
      }
    )
  })
})
