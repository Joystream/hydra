import { ApiPromise, WsProvider } from '@polkadot/api'
import { RegistryTypes, OverrideBundleType } from '@polkadot/types/types'
import pRetry from 'p-retry'
import Debug from 'debug'
import { getConfig } from '../node/config'
import { ISubstrateService } from './ISubstrateService'
import { SubstrateService } from './SubstrateService'

export * from './ISubstrateService'
export * from './SubstrateService'
export { getBlockTimestamp } from './timestamp'

const debug = Debug('hydra-indexer:substrate-api')

let substrateService: ISubstrateService
let apiPromise: ApiPromise

export async function getSubstrateService(): Promise<ISubstrateService> {
  if (substrateService) {
    return substrateService
  }
  substrateService = new SubstrateService()
  await (substrateService as SubstrateService).init()
  return substrateService
}

export async function getApiPromise(): Promise<ApiPromise> {
  if (apiPromise && apiPromise.isConnected) {
    return apiPromise
  }

  debug(`Creating new Api Promise`)

  const conf = getConfig()
  const provider = new WsProvider(conf.WS_PROVIDER_ENDPOINT_URI)

  const names = Object.keys(conf.TYPES_JSON)

  names.length && debug(`Injected types: ${names.join(', ')}`)

  apiPromise = await pRetry(
    async () =>
      new ApiPromise({
        provider,
        types: conf.TYPES_JSON as RegistryTypes,
        typesBundle: conf.BUNDLE_TYPES as OverrideBundleType,
        typesSpec: conf.SPEC_TYPES as Record<string, RegistryTypes>,
        typesChain: conf.CHAIN_TYPES as Record<string, RegistryTypes>,
      }).isReadyOrError,
    { retries: 3 }
  )

  apiPromise.on('error', async (e) => {
    debug(`Api error: ${JSON.stringify(e)}, reconnecting`)
  })

  return apiPromise
}
