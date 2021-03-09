/* eslint-disable */
import { DatabaseManager, SubstrateEvent } from '@dzlzv/hydra-common'

export function balances_TransferEvent(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  console.log('Here')
}

export function balances_TransferCall(
  db: DatabaseManager,
  event: SubstrateEvent
) {
  console.log('Here')
}

export function handleSudoEvent(db: DatabaseManager, event: SubstrateEvent) {}
export function handleSudoCall(db: DatabaseManager, event: SubstrateEvent) {}
export function preBlockHook1(db: DatabaseManager, event: SubstrateEvent) {}
export function preBlockHook2(db: DatabaseManager, event: SubstrateEvent) {}
export function postBlockHook1(db: DatabaseManager, event: SubstrateEvent) {}
export function postBlockHook2(db: DatabaseManager, event: SubstrateEvent) {}
