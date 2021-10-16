import expect from 'expect'
import { queryNode, waitForProcessing } from './api/processor'

describe('end-to-end hook tests', () => {
  let hooks: { type: string; blockNumber: number }[]

  before(async () => {
    await waitForProcessing(4)

    await queryNode
      .query(
        `
      query {
        blockHooks {
          blockNumber
          type
        }
      }
    `
      )
      .then((res) => (hooks = res.blockHooks))

    console.log(`Executed hooks: ${JSON.stringify(hooks, null, 2)}`)
  })

  it('finds pre hooks', async () => {
    const preHooks = hooks
      .filter((h) => h.type === 'PRE')
      .map((h) => h.blockNumber)
    expect(preHooks).toEqual(expect.arrayContaining([0, 1, 2]))
  })

  it('finds post hooks', async () => {
    const postHooks = hooks
      .filter((h) => h.type === 'POST')
      .map((h) => h.blockNumber)
    expect(postHooks).toEqual(expect.arrayContaining([2, 3]))
  })
})
