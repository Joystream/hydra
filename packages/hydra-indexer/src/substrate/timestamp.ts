import { Extrinsic } from '@polkadot/types/interfaces'
import * as BN from 'bn.js'

// Except genesis block all blocks have timestamp event
export function getBlockTimestamp(extrinsics: Extrinsic[]): BN {
  const ex = extrinsics.find(
    ({ method: { method, section } }) =>
      section === 'timestamp' && method === 'set'
  )
  return ex ? new BN(ex.args[0].toJSON() as number) : new BN(0)
}
