import { Extrinsic } from '@polkadot/types/interfaces'

// Except genesis block all blocks have timestamp event
export function getBlockTimestamp(extrinsics: Extrinsic[]): number {
  const ex = extrinsics.find(
    ({ method: { method, section } }) =>
      section === 'timestamp' && method === 'set'
  )
  return ex ? (ex.args[0].toJSON() as number) : 0
}
