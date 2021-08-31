import { expect } from 'chai'
import { lastTimestamp, waitForProcessing } from './api/processor-api'

describe('End-to-end timesamp call tests', () => {
  before(() => waitForProcessing(1))

  it('updates the blockstamp table', async () => {
    const last = await lastTimestamp()
    expect(last).not.to.be.an('undefined')
  })
})
