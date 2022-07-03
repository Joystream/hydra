import { expect } from 'chai'
import { blockTimestamp } from './api/indexer-api'
import {
  fetchDateTimeFieldFromTransfer,
  findTransfersByComment,
  findTransfersByCommentAndWhereCondition,
  findTransfersByValue,
  getProcessorStatus,
  accountByOutgoingTxValue,
  getGQLClient,
  transferChunksByTransferId,
} from './api/processor-api'
import { transfer } from './api/substrate-api'
import pWaitFor from 'p-wait-for'
import {
  ACCOUNTS_BY_VALUE_GT_EVERY,
  ACCOUNTS_BY_VALUE_GT_NONE,
  ACCOUNTS_BY_VALUE_GT_SOME,
  TRANSFER_IN_QUERY,
  VARIANT_FILTER_MISREABLE_ACCOUNTS,
} from './api/graphql-queries'
import { EntityIdGenerator } from '@joystream/hydra-processor/src/executor/EntityIdGenerator'
// You need to be connected to a development chain for this example to work.
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'

const txAmount1 = 232323
const txAmount2 = 1000

describe('end-to-end transfer tests', () => {
  let blockHeight: number

  before(async () => {
    blockHeight = await transfer(ALICE, BOB, txAmount1)

    console.log(
      `Transfer of ${txAmount1} schmeks done at height ${blockHeight}`
    )

    blockHeight = await transfer(ALICE, BOB, txAmount2)
    console.log(
      `Transfer of ${txAmount2} schmeks done at height ${blockHeight}`
    )
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
    const transfers = await findTransfersByValue(txAmount2, blockHeight)
    expect(transfers).length.gte(1, 'The processor should find the transfer')
    expect(transfers[0].toAccount).not.to.be.an(
      'undefined',
      'should load fromAccount field'
    )
    expect(transfers[0].toAccount!.hex).not.to.be.an(
      'undefined',
      'should load fromAccount.hex'
    )
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
    const {
      insertedAt,
      createdAt,
      updatedAt,
      timestamp,
    } = await fetchDateTimeFieldFromTransfer()
    const ts = Number.parseInt(timestamp)

    console.log(`Timestamp: ${timestamp}, ts: ${ts}`)

    expect(new Date(updatedAt).getTime()).to.be.equal(
      new Date(ts).getTime(),
      'should set updatedAt'
    )
    expect(new Date(createdAt).getTime()).to.be.equal(
      new Date(ts).getTime(),
      'should set createdAt'
    )
    expect(new Date(insertedAt).getTime()).to.be.equal(
      new Date(ts).getTime(),
      'should set insertedAt'
    )
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

  it('founds an account by incoming tx value (some)', async () => {
    let accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_SOME,
      BigInt(300000)
    )
    expect(accs.length).to.be.equal(0, 'some tx vals > 300000: false')

    accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_SOME,
      BigInt(200000)
    )
    expect(accs.length).to.be.equal(1, 'some tx vals > 200000: true')
  })

  it('founds an account by incoming tx value (none)', async () => {
    let accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_NONE,
      BigInt(300000)
    )
    expect(accs.length).to.be.equal(2, 'none tx vals > 300000: true') // BOTH BOB AND ALICE

    accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_NONE,
      BigInt(200000)
    )
    expect(accs.length).to.be.equal(1, 'none tx vals > 200000: false') // ONLY BOB, it has no outgoing txs
  })

  it('founds an account by incoming tx value (every)', async () => {
    let accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_EVERY,
      BigInt(txAmount2) // since the value filter is gt,
      // the second transfer does not satisfy the condition
    )
    expect(accs.length).to.be.equal(0, 'every tx val > 1000: false')

    accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_EVERY,
      BigInt(20)
    )
    expect(accs.length).to.be.equal(1, 'every tx val > 20: true')
  })

  it('founds an account by incoming tx value (some)', async () => {
    let accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_SOME,
      BigInt(300000)
    )
    expect(accs.length).to.be.equal(0, 'some tx vals > 300000: false')

    accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_SOME,
      BigInt(200000)
    )
    expect(accs.length).to.be.equal(1, 'some tx vals > 200000: true')
  })

  it('founds an account by incoming tx value (none)', async () => {
    let accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_NONE,
      BigInt(300000)
    )
    expect(accs.length).to.be.equal(2, 'none tx vals > 300000: true') // BOTH BOB AND ALICE

    accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_NONE,
      BigInt(200000)
    )
    expect(accs.length).to.be.equal(1, 'none tx vals > 200000: false') // ONLY BOB, it has no outgoing txs
  })

  it('correctly handles IN query', async () => {
    const transfers = (
      await getGQLClient().request<{
        transfers: { id: string }[]
      }>(TRANSFER_IN_QUERY)
    ).transfers

    // simply check it executes normally
    expect(transfers.length).to.be.equal(0, 'should execute IN query')
  })

  it('founds an account by incoming tx value (every)', async () => {
    let accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_EVERY,
      BigInt(txAmount2) // since the value filter is gt,
      // the second transfer does not satisfy the condition
    )
    expect(accs.length).to.be.equal(0, 'every tx val > 1000: false')

    accs = await accountByOutgoingTxValue(
      ACCOUNTS_BY_VALUE_GT_EVERY,
      BigInt(20)
    )
    expect(accs.length).to.be.equal(1, 'every tx val > 20: true')
  })

  it('should find by a variant filter', async () => {
    const result = await getGQLClient().request<{
      accounts: unknown[]
    }>(VARIANT_FILTER_MISREABLE_ACCOUNTS)

    expect(result.accounts.length).gt(0, 'should find a miserable account')
  })

  it('should create transfer chunks with auto-generated ids', async () => {
    const chunks = await transferChunksByTransferId(
      EntityIdGenerator.entityIdAfter(EntityIdGenerator.zeroEntityId)
    )
    let id: string = EntityIdGenerator.zeroEntityId
    const expectedIds = Array.from(
      { length: 100 },
      () => (id = EntityIdGenerator.entityIdAfter(id))
    )

    expect(chunks.map((c) => c.id)).to.have.same.members(expectedIds)
  })
})
