import { expect } from 'chai'
import { HOOKS } from './api/graphql-queries'
import { getGQLClient, waitForProcessing } from './api/processor-api'

describe('end-to-end hook tests', () => {
  let hooks: { type: string; blockNumber: number }[]

  before(async () => {
    await waitForProcessing(4)

    hooks = (
      await getGQLClient().request<{
        blockHooks: { type: string; blockNumber: number }[]
      }>(HOOKS)
    ).blockHooks
    console.log(`Executed hooks: ${JSON.stringify(hooks, null, 2)}`)
  })

  it('finds pre hooks', async () => {
    const preHooks = hooks
      .filter((h) => h.type === 'PRE')
      .map((h) => h.blockNumber)
    expect(preHooks).to.have.members([0, 1, 2])
  })

  it('finds post hooks', async () => {
    const postHooks = hooks
      .filter((h) => h.type === 'POST')
      .map((h) => h.blockNumber)
    expect(postHooks).to.have.members([2, 3])
  })
})
