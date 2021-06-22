import { ApiPromise, WsProvider } from '@polkadot/api'
import { createTestKeyring } from '@polkadot/keyring/testing'
import { Hash } from '@polkadot/types/interfaces'
import Container from 'typedi'
import pWaitFor from 'p-wait-for'

const typesSpec = {
  'node-template': {
    Address: 'AccountId',
    LookupSource: 'AccountId',
    AccountInfo: 'AccountInfoWithRefCount',
  },
}

export async function transfer(
  from: string,
  to: string,
  amount: number
): Promise<number> {
  const api = Container.get<ApiPromise>('ApiPromise')
  // Create a extrinsic, transferring randomAmount units to Bob.
  const transfer = api.tx.balances.transfer(to, amount)

  const keyring = createTestKeyring()

  // Sign and Send the transaction
  let blockHash: Hash | undefined

  await Promise.race([
    await transfer.signAndSend(keyring.getPair(from), ({ status }) => {
      console.log(`Status of transfer: ${status.type}`)
      if (status.isFinalized) {
        blockHash = status.asFinalized
      }
    }),
    await pWaitFor(() => blockHash !== undefined),
  ])

  if (blockHash === undefined) {
    throw new Error('The transfer was not finalized')
  }
  console.log(`Finalized at hash ${blockHash.toHuman()}`)
  return await getBlockHeight(blockHash)
}

export async function getBlockHeight(hash: Hash): Promise<number> {
  const api = Container.get<ApiPromise>('ApiPromise')
  const signedBlock = await api.rpc.chain.getBlock(hash)
  return signedBlock.block.header.number.toNumber()
}

export async function createApi(wsProviderURI: string): Promise<ApiPromise> {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider(wsProviderURI)

  // Create the API and wait until ready
  const apiPromise = new ApiPromise({ provider, typesSpec })
  const api = await apiPromise.isReadyOrError

  Container.set('ApiPromise', apiPromise)

  return api
}
