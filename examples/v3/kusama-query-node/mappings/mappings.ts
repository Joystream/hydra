import { Transfer, Account } from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances as BalancesV1 } from './generated/types-V1'
import { Balances as BalancesV2 } from './generated/types-V2'

import { AccountId, Balance } from '@polkadot/types/interfaces'

import BN from 'bn.js'
import {
  EventContext,
  StoreContext,
  BlockContext,
  DatabaseManager,
} from '@joystream/hydra-common'

async function getOrCreate<T>(
  e: { new (...args: any[]): T },
  id: string,
  store: DatabaseManager
): Promise<T> {
  let entity: T | undefined = await store.get<T>(e, {
    where: { id },
  })

  if (entity === undefined) {
    entity = new e() as T
    ;(<any>entity).id = id
  }
  return entity
}

export async function balancesTransfer(
  { store, block, extrinsic }: EventContext & StoreContext,
  [from, to, value]: [AccountId, AccountId, Balance]
) {
  const transfer = new Transfer()
  const fromAcc = await getOrCreate<Account>(Account, from.toString(), store)
  fromAcc.hex = from.toHex()
  const toAcc = await getOrCreate<Account>(Account, to.toString(), store)
  toAcc.hex = to.toHex()

  transfer.value = value.toBn()
  transfer.tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)

  fromAcc.balance = fromAcc.balance || new BN(0)
  fromAcc.balance = fromAcc.balance.sub(value)
  fromAcc.balance = fromAcc.balance.sub(transfer.tip)

  await store.save<Account>(fromAcc)

  toAcc.balance = toAcc.balance || new BN(0)
  toAcc.balance = toAcc.balance.add(value)
  await store.save<Account>(toAcc)

  transfer.from = fromAcc
  transfer.to = toAcc

  transfer.insertedAt = new Date(block.timestamp)
  transfer.block = block.height
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.timestamp = new BN(block.timestamp)

  await store.save<Transfer>(transfer)
}

export async function balancesTransferV1(ctx: EventContext & StoreContext) {
  const [from, to, value] = new BalancesV1.TransferEvent(ctx.event).params
  await balancesTransfer(ctx, [from, to, value])
}

export async function balancesTransferV2(ctx: EventContext & StoreContext) {
  const [from, to, value] = new BalancesV2.TransferEvent(ctx.event).params
  await balancesTransfer(ctx, [from, to, value])
}

export async function genesisLoader({
  block,
  store,
}: BlockContext & StoreContext) {
  console.log(`Loading data before block ${block.height}`)
  // load some data using store here
  await new Promise((resolve) => setTimeout(resolve, 100))

  console.log(`Done`)
}
