import { SubstrateEvent } from '@dzlzv/hydra-common'
import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { Transfer } from '../generated/graphql-server/src/modules/transfer/transfer.model'
// run 'yarn codegen:event-types --metadata wss://cc3-5.kusama.network Balances.Transfer' 
// to generate typings for the Balances.transfer event
import { Balances } from './generated/types'

export async function balancesTransfer(
  db: DatabaseManager,
  _event: SubstrateEvent
) {
  const event = new Balances.TransferEvent(_event);
  const transfer = new Transfer()
  transfer.from = Buffer.from(event.data.accountIds[0].toHex())
  transfer.to = Buffer.from(event.data.accountIds[1].toHex())
  transfer.value = event.data.balance.toBn()
  transfer.block = event.ctx.blockNumber
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`

  console.log(`Saving ${JSON.stringify(transfer, null, 2)}`)

  await db.save<Transfer>(transfer)
}
