import { expect } from 'chai'
import { waitForAsync } from '@dzlzv/hydra-common'
import { indexerHead, blockTimestamp } from './api/indexer-api'
import {
  fetchDateTimeFieldFromTransfer,
  findTransfersByComment,
  findTransfersByValue,
} from './api/processor-api'
import { transfer } from './api/substrate-api'

// You need to be connected to a development chain for this example to work.
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'

describe('End-to-end tests', () => {
  let amount: number
  let blockHeight: number

  before(async () => {
    amount = 213423
    blockHeight = await transfer(ALICE, BOB, amount)
    console.log(`Transfer of ${amount} schmeks done at height ${blockHeight}`)
    // wait until the indexer indexes the block
    await waitForAsync(
      async () => (await indexerHead()) > blockHeight.valueOf() + 5
    )
    console.log(`Indexer processed block ${blockHeight}`)
  })

  it('indexes and finds transfers', async () => {
    const transfers = await findTransfersByValue(amount, blockHeight)
    expect(transfers).length.gte(1, 'The processor should find the transfer')
  })

  it('performs full-text-search', async () => {
    const highlihts: string[] = await findTransfersByComment('transfer')
    expect(highlihts).length.gte(1, 'Full text search should find comment')
    expect(highlihts[0]).contains('Transfer')
  })

  it('fetch block timestamp from substrate event', async () => {
    const tm = await blockTimestamp()
    expect(tm).not.equal(0, 'Timestamp should not be equal to zero (0)')
    expect(tm).to.be.lessThan(
      Date.now(),
      'Timestamp should be less then Date.now()'
    )
  })

  it('fetch datetime field from transfer', async () => {
    const date = await fetchDateTimeFieldFromTransfer()
    expect(date.getTime()).to.be.lessThan(Date.now())
  })
})
