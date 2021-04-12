import { AnyJson, AnyJsonField } from './json-types'

export interface EventParam {
  type: string
  name: string
  value: AnyJsonField
}

export interface ExtrinsicArg {
  type: string
  name: string
  value: AnyJsonField
}

export interface SubstrateEvent {
  name: string
  method: string
  section?: string
  params: Array<EventParam>
  index: number
  id: string
  blockNumber: number
  extrinsic?: SubstrateExtrinsic
  blockTimestamp: BN
}

export interface SubstrateExtrinsic {
  method: string
  section: string
  versionInfo?: string
  meta?: AnyJson
  era?: AnyJson
  signer: string
  args: ExtrinsicArg[]
  signature?: string
  hash?: string
  tip: BN
}

// return id in the format 000000..00<blockNum>-000<index>
// the reason for such formatting is to be able to efficiently sort events
// by ID
export function formatEventId(blockNumber: number, index: number): string {
  return `${String(blockNumber).padStart(16, '0')}-${String(index).padStart(
    6,
    '0'
  )}`
}
