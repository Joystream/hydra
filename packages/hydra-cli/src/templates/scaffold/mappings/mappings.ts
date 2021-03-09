import { DatabaseManager } from '@dzlzv/hydra-common'
import { Transfer } from '../generated/graphql-server/src/modules/transfer/transfer.model'
import { BlockTimestamp } from '../generated/graphql-server/src/modules/block-timestamp/block-timestamp.model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances, Timestamp } from './generated/types'
import BN from 'bn.js'

const start = Date.now()
let total = 0

export async function balancesTransfer(
  db: DatabaseManager,
  event: Balances.TransferEvent
) {
  const transfer = new Transfer()
  transfer.from = Buffer.from(event.data.accountIds[0].toHex())
  transfer.to = Buffer.from(event.data.accountIds[1].toHex())
  transfer.value = event.data.balance.toBn()
  transfer.block = event.ctx.blockNumber
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.insertedAt = new Date()
  await db.save<Transfer>(transfer)
}

export async function timestampCall(
  db: DatabaseManager,
  call: Timestamp.SetCall
) {
  benchmarkExtrinsics()
  const block = new BlockTimestamp()
  block.timestamp = call.args.now.toBn()
  block.blockNumber = new BN(call.ctx.blockNumber)
  console.log(`New block ${block.blockNumber} at ${block.timestamp}`)

  await db.save<BlockTimestamp>(block)
}

function benchmarkExtrinsics() {
  const millis = Date.now() - start
  total = total + 1
  if (total % 10 === 0) {
    console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`)
    console.log(`Everage time ms: ${millis / total}, total events: ${total}`)
  }
}
