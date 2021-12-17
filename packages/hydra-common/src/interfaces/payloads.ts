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
