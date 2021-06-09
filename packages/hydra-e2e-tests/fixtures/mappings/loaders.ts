import {
  Event,
  EventA,
  EventB,
  EventC,
  Network,
} from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { BlockContext, StoreContext } from '@dzlzv/hydra-common'

// run before genesis
export async function loader({ store }: BlockContext & StoreContext) {
  console.log(`Loading events`)
  const a = new EventA({
    inExtrinsic: 'test',
    inBlock: 0,
    network: Network.ALEXANDRIA,
    indexInBlock: 0,
    field1: 'field1',
  })

  const b = new EventB({
    inExtrinsic: 'test',
    inBlock: 0,
    network: Network.BABYLON,
    indexInBlock: 1,
    field2: 'field2',
  })

  const c = new EventC({
    inExtrinsic: 'test',
    inBlock: 0,
    network: Network.OLYMPIA,
    indexInBlock: 2,
    field3: 'field3',
  })

  await Promise.all([
    store.save<EventA>(a),
    store.save<EventB>(b),
    store.save<EventC>(c),
  ])
  console.log(`Loaded events`)
}
