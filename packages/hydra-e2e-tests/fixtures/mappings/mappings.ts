import {
  Transfer,
  TransferChunk,
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
  FindOptionsWhere,
} from '@joystream/hydra-common'

async function getOrCreate<T>(
  E: { new (...args: any[]): T },
  id: string,
  store: DatabaseManager
): Promise<T> {
  let entity: T | undefined = await store.get<T>(E, {
    where: ({ id } as unknown) as FindOptionsWhere<T>,
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
  fromAcc.status = {
    hates: 'ALICE',
    loves: ['money', 'crypto'],
    isTypeOf: 'Miserable',
  }

  await store.save<Account>(fromAcc)

  toAcc.balance = toAcc.balance || new BN(0)
  toAcc.balance = toAcc.balance.add(value)
  toAcc.status = {
    father: { hates: 'BOB', isTypeOf: 'Miserable' },
    isTypeOf: 'MiddleClass',
  }
  await store.save<Account>(toAcc)

  transfer.fromAccount = fromAcc
  transfer.toAccount = toAcc

  transfer.block = block.height
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.timestamp = new BN(block.timestamp)
  console.log(`Saving transfer: ${JSON.stringify(transfer, null, 2)}`)
  await store.save<Transfer>(transfer)

  const remaining = transfer.value
  const numChunks = 100
  await Promise.all(
    Array.from({ length: numChunks }, (_, i) => {
      const chunkSize =
        i === numChunks - 1
          ? remaining.toNumber()
          : Math.floor(transfer.value.divn(numChunks).toNumber())
      remaining.subn(chunkSize)
      const chunk = new TransferChunk({
        chunkSize,
        transfer,
      })
      return store.save<TransferChunk>(chunk)
    })
  )
}

export async function timestampCall({
  store,
  event,
  block: { height, hash, timestamp },
}: ExtrinsicContext & StoreContext) {
  const call = new Timestamp.SetCall(event)
  const ts = call.args.now.toBn()

  const blockTs = new BlockTimestamp()

  blockTs.blockNumber = height
  blockTs.id = hash
  blockTs.timestamp = new BN(ts)

  if (ts.toNumber() !== timestamp) {
    throw new Error(`Block timestamp does not match timestamp.setcall argument`)
  }

  await store.save<BlockTimestamp>(blockTs)
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
  block: { height, hash },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()
  hook.blockNumber = height

  hook.timestamp = <BlockTimestamp>(
    await store.get(BlockTimestamp, { where: { id: hash } })
  )

  if (hook.timestamp === undefined) {
    throw new Error(`BlockTimestamp should be created`)
  }

  hook.type = HookType.POST

  await store.save<BlockHook>(hook)
}
