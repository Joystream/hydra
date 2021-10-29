import {
  Transfer,
  BlockTimestamp,
  BlockHook,
  HookType,
  Account,
  Miserable,
  MiddleClass,
} from '../generated/model'
import { Balances, Timestamp } from '../types'
import {
  ExtrinsicContext,
  EventContext,
  BlockContext,
  StoreContext,
  DatabaseManager,
} from '@subsquid/hydra-common'
import assert from 'assert'

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
  assert(event.section !== undefined, 'Event section is not defined')

  const transfer = new Transfer()
  const [from, to, value] = new Balances.TransferEvent(event).params
  transfer.from = Buffer.from(from.toHex())
  transfer.to = Buffer.from(to.toHex())
  transfer.value = value.toBigInt()
  transfer.tip = extrinsic?.tip || 0n
  transfer.extrinsicId = extrinsic?.id
  transfer.insertedAt = new Date(block.timestamp)

  const fromAcc = await getOrCreate(Account, from.toString(), store)
  const toAcc = await getOrCreate(Account, to.toString(), store)
  fromAcc.hex = from.toHex()
  toAcc.hex = to.toHex()

  fromAcc.balance = fromAcc.balance || 0n
  console.log(typeof fromAcc.balance)
  fromAcc.balance -= value.toBigInt()
  fromAcc.balance -= transfer.tip
  fromAcc.status = new Miserable()
  fromAcc.status.hates = 'ALICE'
  fromAcc.status.loves = ['money', 'crypto']
  await store.save(fromAcc)

  toAcc.balance = toAcc.balance || 0n
  toAcc.balance += value.toBigInt()
  toAcc.status = new MiddleClass()
  toAcc.status.father = new Miserable()
  toAcc.status.father.hates = 'BOB'
  toAcc.status.father.loves = []
  await store.save(toAcc)

  transfer.fromAccount = fromAcc
  transfer.toAccount = toAcc

  transfer.block = block.height
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.timestamp = BigInt(block.timestamp)
  console.log(transfer.comment)
  await store.save(transfer)
}

export async function timestampCall({
  store,
  extrinsic,
  block: { height, hash, timestamp },
}: ExtrinsicContext & StoreContext) {
  const call = new Timestamp.SetCall(extrinsic)
  const ts = call.now.toBigInt()

  const blockTs = new BlockTimestamp()
  blockTs.blockNumber = height
  blockTs.id = hash
  blockTs.timestamp = ts

  if (Number(ts) !== timestamp) {
    throw new Error(`Block timestamp does not match timestamp.setcall argument`)
  }
  await store.save(blockTs)
}

export async function preHook({
  block: { height },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()
  hook.blockNumber = height
  hook.type = HookType.PRE
  await store.save(hook)
}

export async function postHook({
  block: { height, hash },
  store,
}: BlockContext & StoreContext) {
  const timestamp = await store.get(BlockTimestamp, { where: { id: hash } })
  if (timestamp == null) {
    throw new Error(`BlockTimestamp should be created`)
  }
  const hook = new BlockHook()
  hook.type = HookType.POST
  hook.blockNumber = height
  hook.timestamp = timestamp
  await store.save(hook)
}
