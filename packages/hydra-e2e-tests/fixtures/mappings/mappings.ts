import {
  Transfer,
  BlockTimestamp,
  BlockHook,
  HookType,
  Account,
} from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances, Timestamp } from './generated/types'
import BN from 'bn.js'
import {
  ExtrinsicContext,
  EventContext,
  BlockContext,
  StoreContext,
  DatabaseManager,
} from '@dzlzv/hydra-common'

async function getOrCreate<T>(
  E: { new (...args: any[]): T },
  id: string,
  store: DatabaseManager
): Promise<T> {
  let entity: T | undefined = await store.get<T>(E, {
    where: { id },
  })

  if (entity === undefined) {
    entity = new E() as T
    ;(<any>entity).id = id
  }
  return entity
}

export async function balancesTransfer({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const transfer = new Transfer()
  const [from, to, value] = new Balances.TransferEvent(event).params
  transfer.from = Buffer.from(from.toHex())
  transfer.to = Buffer.from(to.toHex())
  transfer.value = value.toBn()
  transfer.tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)
  transfer.insertedAt = new Date(block.timestamp)

  const fromAcc = await getOrCreate<Account>(Account, from.toString(), store)
  fromAcc.hex = from.toHex()
  const toAcc = await getOrCreate<Account>(Account, to.toString(), store)
  toAcc.hex = to.toHex()

  fromAcc.balance = fromAcc.balance || new BN(0)
  fromAcc.balance = fromAcc.balance.sub(value)
  fromAcc.balance = fromAcc.balance.sub(transfer.tip)

  await store.save<Account>(fromAcc)

  toAcc.balance = toAcc.balance || new BN(0)
  toAcc.balance = toAcc.balance.add(value)
  await store.save<Account>(toAcc)

  transfer.fromAccount = fromAcc
  transfer.toAccount = toAcc

  transfer.block = block.height
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.timestamp = new BN(block.timestamp)
  console.log(`Saving transfer: ${JSON.stringify(transfer, null, 2)}`)
  await store.save<Transfer>(transfer)
}

export async function timestampCall({
  store,
  event,
  block,
}: ExtrinsicContext & StoreContext) {
  const call = new Timestamp.SetCall(event)
  const blockT = new BlockTimestamp()
  blockT.timestamp = call.args.now.toBn()
  blockT.blockNumber = block.height
  await store.save<BlockTimestamp>(blockT)
}

export async function preHook({
  block: { height },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()
  hook.blockNumber = height
  hook.type = HookType.PRE
  await store.save<BlockHook>(hook)
}

export async function postHook({
  block: { height },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()
  hook.blockNumber = height
  hook.type = HookType.POST
  await store.save<BlockHook>(hook)
}
