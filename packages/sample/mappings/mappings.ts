import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { Transfer } from '../generated/graphql-server/src/modules/transfer/transfer.model'
import { BlockTimestamp } from '../generated/graphql-server/src/modules/block-timestamp/block-timestamp.model'
import {
  BlockHook,
  HookType,
} from '../generated/graphql-server/src/modules/block-hook/block-hook.model'
// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances, Timestamp } from './generated/types'
import BN from 'bn.js'
import { SubstrateEvent } from '@dzlzv/hydra-common'

const start = Date.now()
let blockTime = 0
let blockStartTime = 0
let totalEvents = 0
let totalBlocks = 0

export async function balancesTransfer({
  store,
  event,
  block,
}: {
  store: DatabaseManager
  event: SubstrateEvent
  block: { blockNumber: number }
}) {
  const transfer = new Transfer()
  const _event = new Balances.TransferEvent(event)
  transfer.from = Buffer.from(_event.data.accountIds[0].toHex())
  transfer.to = Buffer.from(_event.data.accountIds[1].toHex())
  transfer.value = _event.data.balance.toBn()
  transfer.block = block.blockNumber
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.insertedAt = new Date()
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

  await store.save<BlockTimestamp>(block)
}

export async function preHook({
  block: { blockNumber },
  store,
}: {
  block: { blockNumber: BN }
  store: DatabaseManager
}) {
  const hook = new BlockHook()
  hook.blockNumber = blockNumber
  hook.type = HookType.PRE
  await store.save<BlockHook>(hook)
}

export async function postHook({
  block: { blockNumber },
  store,
}: {
  block: { blockNumber: BN }
  store: DatabaseManager
}) {
  const hook = new BlockHook()
  hook.blockNumber = blockNumber
  hook.type = HookType.POST
  await store.save<BlockHook>(hook)
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
