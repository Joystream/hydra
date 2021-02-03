import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { Transfer } from '../generated/graphql-server/src/modules/transfer/transfer.model'
// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances } from './generated/types'

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
