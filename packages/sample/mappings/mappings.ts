import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import {
  Transfer,
  BlockTimestamp,
  BlockHook,
  HookType,
} from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances, Timestamp } from './generated/types'
import BN from 'bn.js'
import { SubstrateBlock, SubstrateEvent } from '@dzlzv/hydra-common'

const start = Date.now()
let blockTime = 0
let totalEvents = 0
let totalBlocks = 0

export async function balancesTransfer({
  store,
  event,
  block,
}: {
  store: DatabaseManager
  event: SubstrateEvent
  block: SubstrateBlock
}) {
  const transfer = new Transfer()
  const [from, to, value] = new Balances.TransferEvent(event).params
  transfer.from = Buffer.from(from.toHex())
  transfer.to = Buffer.from(to.toHex())
  transfer.value = value.toBn()

  transfer.block = block.height
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.insertedAt = new Date(block.timestamp)
  totalEvents++
  await store.save<Transfer>(transfer)
}

export async function timestampCall({
  store,
  event,
}: {
  store: DatabaseManager
  event: SubstrateEvent
}) {
  const call = new Timestamp.SetCall(event)
  const block = new BlockTimestamp()
  block.timestamp = call.args.now.toBn()
  block.blockNumber = new BN(call.ctx.blockNumber)
  totalEvents++
  await store.save<BlockTimestamp>(block)
}

export async function timestampCall2({
  store,
  event,
}: {
  store: DatabaseManager
  event: SubstrateEvent
}) {
  console.log(`I am timestampcall 2`)
  const call = new Timestamp.SetCall(event)
  const block = new BlockTimestamp()
  block.timestamp = call.args.now.toBn()
  block.blockNumber = new BN(call.ctx.blockNumber)
  totalEvents++
  await store.save<BlockTimestamp>(block)
}

export async function preHook({
  block: { height },
  store,
}: {
  block: SubstrateBlock
  store: DatabaseManager
}) {
  const hook = new BlockHook()
  hook.blockNumber = new BN(height)
  hook.type = HookType.PRE
  await store.save<BlockHook>(hook)
}

export async function postHook({
  block: { height },
  store,
}: {
  block: SubstrateBlock
  store: DatabaseManager
}) {
  const hook = new BlockHook()
  hook.blockNumber = new BN(height)
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
