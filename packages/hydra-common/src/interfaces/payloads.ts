import { SubstrateBlock } from './substrate-interfaces'
import { pick } from 'lodash'

/**
 * General block information. Typically used as a payload for lightweight subscription messages.
 */
export interface BlockPayload {
  height: number
  hash: string
  parentHash: string
  ts: number
  events: { id: string; name: string }[]
  extrinsics: { id: string; name: string }[]
  runtimeVersion: { specVersion?: string }
}

export function toPayload(sb: SubstrateBlock): BlockPayload {
  return <BlockPayload>{
    ...pick(sb, [
      'events',
      'extrinsics',
      'hash',
      'parentHash',
      'height',
      'runtimeVersion.specVersion',
    ]),
    ts: sb.timestamp,
  }
}
