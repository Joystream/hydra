import pWaitFor from 'p-wait-for'
import { expect } from 'chai'
import { HOOKS } from './api/graphql-queries'
import { getGQLClient, getProcessorStatus } from './api/processor-api'

const hooksTo = 4

describe('end-to-end hook tests', () => {
  let hooks: { type: string; blockNumber: number }[]

  before(async () => {
    // wait until the indexer indexes the block and the processor picks it up
    await pWaitFor(
      async () => {
        return (await getProcessorStatus()).lastCompleteBlock > hooksTo
      },
      { interval: 50 }
    )
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
