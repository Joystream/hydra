import { expect } from 'chai'
import { getProcessorHead, lastTimestamp } from './api/processor-api'
import pWaitFor = require('p-wait-for')

describe('End-to-end timesamp call tests', () => {
  before(async () => {
    // wait until the indexer indexes the block and the processor picks it up
    await pWaitFor(
      async () => {
        const head = await getProcessorHead()
        return head > 1
      },
      { interval: 50 }
    )
    console.log(`Processed first block`)
  })

  it('updates the blockstamp table', async () => {
    const last = await lastTimestamp()
    expect(last).not.to.be.an('undefined')
  })
})
