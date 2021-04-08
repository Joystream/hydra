// import { BlockNumber } from '@polkadot/types/interfaces';
import { IQueryEvent, QueryEvent } from './'

import {
  EventRecord,
  SignedBlock,
  RuntimeVersion,
  LastRuntimeUpgradeInfo,
} from '@polkadot/types/interfaces'

import BN from 'bn.js'

export class QueryEventBlock {
  readonly blockNumber: number

  readonly queryEvents: IQueryEvent[]

  constructor(blockNumber: number, queryEvents: IQueryEvent[]) {
    this.blockNumber = blockNumber
    this.queryEvents = queryEvents
  }
}

export interface BlockData {
  events: EventRecord[]
  signedBlock: SignedBlock
  timestamp: BN
  lastUpgrade: LastRuntimeUpgradeInfo
  runtimeVersion: RuntimeVersion
}

export function fromBlockData({
  events,
  signedBlock: { block },
  timestamp,
}: BlockData): QueryEventBlock {
  const blockExtrinsics = block.extrinsics.toArray()
  const height = block.header.number.toNumber()
  const blockEvents: IQueryEvent[] = events.map(
    (record, index): IQueryEvent => {
      // Extract the phase, event
      const { phase } = record
      // Try to recover extrinsic: only possible if its right phase, and extrinsics arra is non-empty, the last constraint
      // is needed to avoid events from build config code in genesis, and possibly other cases.
      const extrinsic =
        phase.isApplyExtrinsic && blockExtrinsics.length
          ? blockExtrinsics[Number.parseInt(phase.asApplyExtrinsic.toString())]
          : undefined
      return new QueryEvent(record, height, index, timestamp, extrinsic)
    }
  )
  return new QueryEventBlock(height, blockEvents)
}
