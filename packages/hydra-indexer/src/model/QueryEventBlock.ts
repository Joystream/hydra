// import { BlockNumber } from '@polkadot/types/interfaces';
import { IQueryEvent, QueryEvent } from './'

import {
  EventRecord,
  SignedBlock,
  RuntimeVersion,
  LastRuntimeUpgradeInfo,
  Extrinsic,
} from '@polkadot/types/interfaces'

import { u32 } from '@polkadot/types'

export interface QueryEventBlock {
  blockNumber: number
  blockEvents: IQueryEvent[]
}

export interface BlockData {
  events: EventRecord[]
  signedBlock: SignedBlock
  timestamp: number
  lastRuntimeUpgrade: LastRuntimeUpgradeInfo
  runtimeVersion: RuntimeVersion
}

export function fromBlockData({
  events,
  signedBlock: { block },
  timestamp,
}: BlockData): QueryEventBlock {
  const extrinsics = block.extrinsics.toArray()
  const blockNumber = block.header.number.toNumber()
  const blockEvents: IQueryEvent[] = events.map(
    (record, index): IQueryEvent => {
      // Extract the phase, event
      const extrinsic = getExtrinsic({ record, extrinsics })
      return new QueryEvent(record, blockNumber, index, timestamp, extrinsic)
    }
  )
  return { blockNumber, blockEvents }
}

export function getExtrinsicIndex(record: {
  phase: { isApplyExtrinsic: boolean; asApplyExtrinsic: u32 }
}): number | undefined {
  const { phase } = record
  // Try to recover extrinsic: only possible if its right phase, and extrinsics arra is non-empty, the last constraint
  // is needed to avoid events from build config code in genesis, and possibly other cases.
  return phase.isApplyExtrinsic ? phase.asApplyExtrinsic.toNumber() : undefined
}

export function getExtrinsic(eventInBlock: {
  record: {
    phase: { isApplyExtrinsic: boolean; asApplyExtrinsic: u32 }
  }
  extrinsics: Extrinsic[]
}): Extrinsic | undefined {
  const extrinsicIndex = getExtrinsicIndex(eventInBlock.record)

  return extrinsicIndex !== undefined &&
    eventInBlock.extrinsics.length > extrinsicIndex
    ? eventInBlock.extrinsics[extrinsicIndex]
    : undefined
}
