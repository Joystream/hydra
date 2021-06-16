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
} from '@joystream/hydra-common'

const start = Date.now()
let blockTime = 0
let totalEvents = 0
let totalBlocks = 0

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

export async function balancesTransfer({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const transfer = new Transfer()
  const [from, to, value] = new Balances.TransferEvent(event).params
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
  totalEvents++

  await store.save<Transfer>(transfer)
}

export async function timestampCall({
  store,
  event,
  block,
}: ExtrinsicContext & StoreContext) {
  const call = new Timestamp.SetCall(event)
  const ts = call.args.now.toBn()
  const blockTs = await store.get(BlockTimestamp, {
    where: { timestamp: ts },
  })

  if (blockTs === undefined) {
    throw new Error(`Expected the timestamp ${ts.toString()} to be saved`)
  }

  if (block.timestamp !== ts.toNumber()) {
    throw new Error(`Block timestamp should match the time int TimeStamp`)
  }
}

export async function preHook({
  block: { height, timestamp, hash },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()

  const ts = new BlockTimestamp()

  ts.blockNumber = new BN(height)
  ts.id = hash
  ts.timestamp = new BN(timestamp)

  await store.save<BlockTimestamp>(ts)
  hook.timestamp = ts
  hook.blockNumber = new BN(height)
  hook.type = HookType.PRE
  await store.save<BlockHook>(hook)
}

export async function postHook({
  block: { height, hash },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()
  hook.blockNumber = new BN(height)

  hook.timestamp = <BlockTimestamp>(
    await store.get(BlockTimestamp, { where: { id: hash } })
  )
  hook.type = HookType.POST

  await store.save<BlockHook>(hook)
  totalBlocks++
  benchmark()
}

function benchmark() {
  const millis = Date.now() - start
  if (totalEvents % 10 === 0) {
    console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`)
    console.log(
      `Everage event time ms: ${millis / totalEvents}, block exec time ms: ${
        blockTime / totalBlocks
      }, total events: ${totalEvents}, total blocks: ${totalBlocks}`
    )
  }
}
