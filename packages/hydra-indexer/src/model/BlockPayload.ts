import { SubstrateBlock } from '@dzlzv/hydra-common'

export interface BlockPayload {
  height: number
  ts: number
  events: { id: string; name: string }[]
  extrinsics: { id: string; name: string }[]
}

// export function toPayload(qeb: {
//   blockNumber: number
//   blockEvents: { eventName: string }[]
// }): BlockPayload {
//   return (withTs({
//     height: qeb.blockNumber,
//     events: qeb.blockEvents.map((e, index) => {
//       return {
//         name: e.eventName,
//         id: formatEventId(qeb.blockNumber, index),
//       }
//     }),
//   }) as unknown) as BlockPayload
// }

export function toPayload(sb: SubstrateBlock): BlockPayload {
  return {
    ...sb,
    ts: sb.timestamp,
  }
}
