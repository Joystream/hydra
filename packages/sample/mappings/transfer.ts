import { SubstrateEvent } from '@dzlzv/hydra-common'
import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { Transfer } from '../generated/graphql-server/src/modules/transfer/transfer.model'
// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances } from './generated/types'

export async function balancesTransfer(
  db: DatabaseManager,
  _event: SubstrateEvent
) {
  const event = new Balances.TransferEvent(_event)
  const transfer = new Transfer()
  transfer.from = Buffer.from(event.data.accountIds[0].toHex())
  transfer.to = Buffer.from(event.data.accountIds[1].toHex())
  transfer.value = event.data.balance.toBn()
  transfer.block = event.ctx.blockNumber
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.insertedAt = new Date()
  console.log(`Saving ${JSON.stringify(transfer, null, 2)}`)

  await db.save<Transfer>(transfer)
}
