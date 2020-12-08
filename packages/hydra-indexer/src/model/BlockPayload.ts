import { formatEventId, QueryEventBlock } from '.'
import { withTs } from '@dzlzv/hydra-common'

export interface BlockPayload {
  height: number
  ts: number
  events?: { id: string; name: string }[]
}

export function toPayload(qeb: QueryEventBlock): BlockPayload {
  return (withTs({
    height: qeb.blockNumber,
    events: qeb.queryEvents.map((e) => {
      return {
        name: e.eventName,
        id: formatEventId(qeb.blockNumber, e.index),
      }
    }),
  }) as unknown) as BlockPayload
}
