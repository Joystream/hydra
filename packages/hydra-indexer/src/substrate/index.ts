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

export async function getSubstrateService(): Promise<ISubstrateService> {
  if (substrateService) {
    return substrateService
  }
  substrateService = new SubstrateService()
  await (substrateService as SubstrateService).init({
    poolSize: getConfig().SUBSTRATE_API_POOL_SIZE,
  })
  return substrateService
}

export async function createApiPromise(): Promise<ApiPromise> {
  debug(`Creating new Api Promise`)

  const conf = getConfig()
  const provider = new WsProvider(conf.WS_PROVIDER_ENDPOINT_URI)

  const names = Object.keys(conf.TYPES_JSON)

  names.length && debug(`Injected types: ${names.join(', ')}`)

  return pRetry(
    async () =>
      new ApiPromise({
        provider,
        types: conf.TYPES_JSON as RegistryTypes,
        typesBundle: conf.BUNDLE_TYPES as OverrideBundleType,
        typesSpec: conf.SPEC_TYPES as Record<string, RegistryTypes>,
        typesChain: conf.CHAIN_TYPES as Record<string, RegistryTypes>,
      }).isReadyOrError,
    {
      retries: 99, // large enough
      onFailedAttempt: (error) =>
        debug(`API failed to connect: ${JSON.stringify(error)}`),
    }
  )
}
