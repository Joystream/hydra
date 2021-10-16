import { ApiPromise, WsProvider } from '@polkadot/api'
import { createTestKeyring } from '@polkadot/keyring/testing'
import { Hash } from '@polkadot/types/interfaces'

const api = new ApiPromise({
  provider: new WsProvider('ws://node-template:9944'),
  typesSpec: {
    'node-template': {
      Address: 'AccountId',
      LookupSource: 'AccountId',
      AccountInfo: 'AccountInfoWithRefCount',
    },
  },
})

export function chain(): Promise<ApiPromise> {
  return api.isReady
}

export async function getBlockHeight(hash: Hash): Promise<number> {
  const api = await chain()
  const signedBlock = await api.rpc.chain.getBlock(hash)
  return signedBlock.block.header.number.toNumber()
}

export async function transfer(
  from: string,
  to: string,
  amount: number
): Promise<number> {
  const api = await chain()
  const keyring = createTestKeyring()
  const sender = keyring.getPair(from)

  const blockHash = await new Promise<Hash>((resolve, reject) => {
    let unsub = () => {
      /* dummy */
    }
    api.tx.balances
      .transfer(to, amount)
      .signAndSend(sender, (result) => {
        console.log(`Status of transfer: ${result.status.type}`)
        if (result.isFinalized) {
          unsub()
          resolve(result.status.asFinalized)
          return
        }
        if (result.isError) {
          unsub()
          reject(
            result.dispatchError ||
              result.internalError ||
              new Error('Failed to perform transfer')
          )
        }
      })
      .then((u) => (unsub = u), reject)
  })

  return getBlockHeight(blockHash)
}
