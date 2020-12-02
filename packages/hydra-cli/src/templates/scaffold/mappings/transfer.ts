import { SubstrateEvent, DB } from '../generated/hydra-processor'
import { Transfer } from '../generated/graphql-server/src/modules/transfer/transfer.model'
import BN from 'bn.js'

export async function balances_Transfer(db: DB, event: SubstrateEvent) {
  const [from, to, value] = event.params
  const transfer = new Transfer()
  transfer.from = Buffer.from(from.value as string)
  transfer.to = Buffer.from(to.value as string)
  transfer.value = convertBN(value.value as string)
  transfer.block = event.blockNumber
  transfer.comment = `Transferred ${value.value as string} from ${
    from.value as string
  } to ${to.value as string}`
  await db.save<Transfer>(transfer)
}

function convertBN(s: string): BN {
  if (String(s).startsWith('0x')) {
    return new BN(s.substring(2), 16)
  }
  return new BN(s)
}
