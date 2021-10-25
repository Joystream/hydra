import expect from 'expect'
import { transfer } from './api/chain'
import { indexer } from './api/indexer'
import { queryNode, waitForProcessing } from './api/processor'

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

    await waitForProcessing(blockHeight)
    console.log(`The processor processed block ${blockHeight}`)
  })

  it('indexes and finds transfers', () => {
    return queryNode.test(
      `
      query {
        transfers(where: { value_eq: ${txAmount2}, block_eq: ${blockHeight} }) {
          fromAccount {
            id
            hex
          }
          toAccount {
            id
            hex
          }
        }
      }
    `,
      {
        transfers: [
          {
            fromAccount: {
              id: ALICE,
              hex: expect.stringMatching(/^0x/),
            },
            toAccount: {
              id: BOB,
              hex: expect.stringMatching(/^0x/),
            },
          },
        ],
      }
    )
  })

  it('extrinsic.id is exposed and mapped', function () {
    return queryNode.test(
      `
      query {
        transfers(limit: 1) {
          extrinsicId
        }
      }
    `,
      {
        transfers: [{ extrinsicId: expect.stringMatching(/\d/) }],
      }
    )
  })

  it('performs full-text-search', () => {
    return queryNode.test(
      `
      query {
        commentSearch(text: "transfer") {
          highlight
        }
      }
    `,
      {
        commentSearch: expect.arrayContaining([
          { highlight: expect.stringContaining('<b>Transfer') },
        ]),
      }
    )
  })

  it('performs full-text-search with filtering options with no result', () => {
    return queryNode.test(
      `
      query {
        commentSearch(text: "transfer", whereTransfer: {from_eq: "0x111111"}) {
          highlight
        }
      }
    `,
      {
        commentSearch: [],
      }
    )
  })

  it('performs full-text-search with filtering options with some result', async () => {
    const aliceAddressAsBytes =
      '0x307864343335393363373135666464333163363131343161626430346139396664363832326338353538383534636364653339613536383465376135366461323764'

    return queryNode.test(
      `
      query {
        commentSearch(text: "transfer", whereTransfer: {from_eq: "${aliceAddressAsBytes}"}) {
          highlight
        }
      }
    `,
      {
        commentSearch: expect.arrayContaining([
          { highlight: expect.stringContaining('<b>Transfer') },
        ]),
      }
    )
  })

  it('fetches one-to-many relations', () => {
    return queryNode.test(
      `
      query {
        account: accountByUniqueInput(where: { id: "${BOB}" }) {
          id
          incomingTx {
            value
          }
        }
      }
    `,
      {
        account: {
          id: BOB,
          incomingTx: [
            { value: txAmount1.toString() },
            { value: txAmount2.toString() },
          ],
        },
      }
    )
  })

  it('fetches one-to-many relations when where condition is present', async () => {
    return queryNode.test(
      `
      query {
        accounts(where: { incomingTx_some: { value_eq: ${txAmount2} } }) {
          id
          incomingTx {
            value
          }
        }
      }
    `,
      {
        accounts: [
          {
            id: BOB,
            incomingTx: [
              { value: txAmount1.toString() },
              { value: txAmount2.toString() },
            ],
          },
        ],
      }
    )
  })

  it('fetch block timestamp from substrate event', async () => {
    const data = await indexer.query(`
      query {
        substrate_event(limit: 1) {
          blockTimestamp
        }
      }
    `)
    expect(data).toEqual({
      substrate_event: [
        {
          blockTimestamp: expect.anything(),
        },
      ],
    })
    const tm = parseInt(data.substrate_event[0].blockTimestamp)
    expect(tm).toBeGreaterThan(0)
    expect(tm).toBeLessThan(Date.now())
  })

  it('finds an account by outgoing tx value (some)', async () => {
    await queryNode.test(
      `
      query {
        accounts(where: { outgoingTx_some: { value_gt: 300000 } }) {
          id
        }
      }
    `,
      {
        accounts: [],
      }
    )

    await queryNode.test(
      `
      query {
        accounts(where: {outgoingTx_some: {value_gt: 200000}}) {
          id
        }
      }
    `,
      {
        accounts: [{ id: ALICE }],
      }
    )
  })

  it('finds an account by outgoing tx value (none)', async () => {
    await queryNode.test(
      `
      query {
        accounts(where: {outgoingTx_none: {value_gt: 300000}} orderBy: id_DESC) {
          id
        }
      }
    `,
      {
        accounts: [{ id: ALICE }, { id: BOB }],
      }
    )

    await queryNode.test(
      `
      query {
        accounts(where: {outgoingTx_none: {value_gt: 200000}} orderBy: id_DESC) {
          id
        }
      }
    `,
      {
        accounts: [
          { id: BOB }, // ONLY BOB, it has no outgoing txs
        ],
      }
    )
  })

  it('finds an account by outgoing tx value (every)', async () => {
    await queryNode.test(
      `
      query {
        accounts(where: {outgoingTx_every: {value_gt: 1000}} orderBy: id_DESC) {
          id
        }
      }
    `,
      {
        accounts: [{ id: BOB }],
      }
    )

    await queryNode.test(
      `
      query {
        accounts(where: {outgoingTx_every: {value_gt: 20}} orderBy: id_DESC) {
          id
        }
      }
    `,
      {
        accounts: [{ id: ALICE }, { id: BOB }],
      }
    )
  })

  it('correctly handles IN query', () => {
    return queryNode.test(
      `
      query {
        transfers(where: {id_in: ["xxxx", "yyyy"]}) {
          id
        }
      }
    `,
      {
        transfers: [], // simply check it executes normally
      }
    )
  })

  it('should find by a variant filter', () => {
    return queryNode.test(
      `
      query {
        accounts(where: {status: {isTypeOf_eq: "Miserable"}}) {
          status {
            __typename
            ... on Miserable {
              hates
            }
          }
        }
      }
    `,
      {
        accounts: [
          {
            status: {
              __typename: 'Miserable',
              hates: 'ALICE',
            },
          },
        ],
      }
    )
  })
})
