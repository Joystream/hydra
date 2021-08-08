import {
  Event,
  EventA,
  EventB,
  EventC,
  Network,
  ComplexEntity,
  SystemEvent,
  EventParam,
  AdditionalData,
} from '../generated/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { BlockContext, StoreContext } from '@subsquid/hydra-common'

export async function loader(ctx: BlockContext & StoreContext) {
  await eventLoader(ctx)
  await jsonFieldLoader(ctx)
}

// run before genesis
export async function eventLoader({ store }: BlockContext & StoreContext) {
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

  const ce = new ComplexEntity({ arg1: 'xxx', arg2: 'yyy' })
  await store.save<ComplexEntity>(ce)

  const c = new EventC({
    inExtrinsic: 'test',
    inBlock: 0,
    network: Network.OLYMPIA,
    indexInBlock: 2,
    field3: 'field3',
    complexField: ce,
  })

  await Promise.all([
    store.save<EventA>(a),
    store.save<EventB>(b),
    store.save<EventC>(c),
  ])
  console.log(`Loaded events`)
}

export async function jsonFieldLoader({ store }: BlockContext & StoreContext) {
  const e = new SystemEvent()
  const params = new EventParam()
  const additionalData = new AdditionalData()

  params.name = 'account'
  params.type = 'string'
  params.value = '0x000'

  additionalData.data = Buffer.from(`0x000`)

  params.additionalData = [additionalData]
  e.params = params
  e.arrayField = ['aaa', 'bbb', 'ccc']

  await store.save<SystemEvent>(e)
}
