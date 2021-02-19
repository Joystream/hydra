import { ApiPromise } from '@polkadot/api'
import { createApi } from './api/substrate-api'
import * as dotenv from 'dotenv'
import Container from 'typedi'
import { GraphQLClient } from 'graphql-request'
import { SubscriptionClient } from 'graphql-subscriptions-client'
import { subscribeToProcessorStatus } from './api/processor-api'

/* eslint-disable */
// we need to defined WebSocket globally due to https://github.com/lunchboxer/graphql-subscriptions-client/issues/12
declare global {
  var WebSocket: typeof WebSocket
}

globalThis.WebSocket = require('ws')
/* eslint-enable */

before(async () => {
  dotenv.config({ path: './test/e2e/.env' })
  // creates and registers the necessary services
  await createApi(process.env.WS_PROVIDER_URI || '')

  console.log(
    `Using Processor API endpoint ${process.env.PROCESSOR_ENDPOINT_URL}`
  )
  Container.set(
    'ProcessorClient',
    new GraphQLClient(process.env.PROCESSOR_ENDPOINT_URL || '')
  )

  Container.set(
    'SubscriptionClient',
    new SubscriptionClient(process.env.PROCESSOR_ENDPOINT_URL || '', {
      reconnect: true,
      lazy: false,
      connectionCallback: (error) => {
        error && console.error(error)
      },
    })
  )

  subscribeToProcessorStatus()

  console.log(`Using Indexer API endpoint ${process.env.INDEXER_ENDPOINT_URL}`)
  Container.set(
    'IndexerClient',
    new GraphQLClient(process.env.INDEXER_ENDPOINT_URL || '')
  )
})

after(async () => {
  const api = Container.get<ApiPromise>('ApiPromise')
  console.log('Disconnecting from the chain')
  await api.disconnect()

  Container.get<SubscriptionClient>('SubscriptionClient').close()
})
