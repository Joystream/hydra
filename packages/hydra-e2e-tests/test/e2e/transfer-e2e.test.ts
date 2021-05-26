import { expect } from 'chai'
import { blockTimestamp } from './api/indexer-api'
import {
  fetchDateTimeFieldFromTransfer,
  findTransfersByComment,
  findTransfersByCommentAndWhereCondition,
  findTransfersByValue,
  queryInterface,
  getProcessorStatus,
  queryInterfacesByEnum,
} from './api/processor-api'
import { transfer } from './api/substrate-api'
import pWaitFor from 'p-wait-for'
// You need to be connected to a development chain for this example to work.
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'

describe('end-to-end transfer tests', () => {
  let amount: number
  let blockHeight: number

  before(async () => {
    amount = 213423
    blockHeight = await transfer(ALICE, BOB, amount)
    console.log(`Transfer of ${amount} schmeks done at height ${blockHeight}`)
    // wait until the indexer indexes the block and the processor picks it up
    await pWaitFor(
      async () => {
        return (
          (await getProcessorStatus()).lastCompleteBlock > blockHeight.valueOf()
        )
      },
      { interval: 50 }
    )
    console.log(`The processor processed block ${blockHeight}`)
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

  it('performs full-text-search with filtering options with no result', async () => {
    const transfers = await findTransfersByCommentAndWhereCondition(
      'Transfer',
      '4364776e52',
      1
    )
    expect(transfers.length).equal(
      0,
      'Full text search with filtering should not find comment'
    )
  })

  it('performs full-text-search with filtering options with some result', async () => {
    const aliceAddressAsBytes =
      '307864343335393363373135666464333163363131343161626430346139396664363832326338353538383534636364653339613536383465376135366461323764'

    const transfers = await findTransfersByCommentAndWhereCondition(
      'Transfer',
      aliceAddressAsBytes
    )

    expect(transfers.length).gt(
      0,
      'Full text search with filtering should find some comment'
    )
  })

  it('performs query on interface types, expect implementer to hold relationship', async () => {
    const { events } = await queryInterface()
    // We don't expect any data only testing Graphql API types
    expect(events.length).to.be.equal(0, 'should not find any event.')
  })

  it('perform filtering on interfaces by implementers enum types', async () => {
    const { events } = await queryInterfacesByEnum()
    expect(events.length).to.be.equal(0, 'shoud be empty event list')
  })
})
