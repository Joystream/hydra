import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import BN from 'bn.js'
import { SubstrateEvent } from '@dzlzv/hydra-common'

import {
  Transfer,
  BlockTimestamp,
  BlockHook,
  HookType,
} from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances, Timestamp } from './generated/types'

// positional arguments
export async function balancesTransfer(
  store: DatabaseManager,
  event: Balances.TransferEvent
) {
  const transfer = new Transfer()
  transfer.from = Buffer.from(event.data.accountIds[0].toHex())
  transfer.to = Buffer.from(event.data.accountIds[1].toHex())
  transfer.value = event.data.balance.toBn()
  transfer.block = event.ctx.blockNumber
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.insertedAt = new Date()
  await store.save<Transfer>(transfer)
}

// context argument
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
  block.blockNumber = call.ctx.blockNumber

  await store.save<BlockTimestamp>(block)
}

export async function preHook({
  block: { blockNumber },
  store,
}: {
  block: { blockNumber: number }
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
  block: { blockNumber: number }
  store: DatabaseManager
}) {
  const hook = new BlockHook()
  hook.blockNumber = blockNumber
  hook.type = HookType.POST
  await store.save<BlockHook>(hook)
}
