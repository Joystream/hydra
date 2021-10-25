import { BlockContext, StoreContext } from '@subsquid/hydra-common'
import {
  AdditionalData,
  ComplexEntity,
  EventA,
  EventB,
  EventC,
  EventParam,
  Network,
  SystemEvent,
  HappyPoor,
  Issue,
  IssuePayment,
  IssueCancellation,
} from '../generated/model'

export async function loader(ctx: BlockContext & StoreContext) {
  await eventLoader(ctx)
  await jsonFieldLoader(ctx)
  await issueLoader(ctx)
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
    statusList: [new HappyPoor({ isMale: true })],
  })

  const ce = new ComplexEntity()
  ce.arg1 = 'xxx'
  ce.arg2 = 'yyy'
  await store.save(ce)

  const c = new EventC({
    inExtrinsic: 'test',
    inBlock: 0,
    network: Network.OLYMPIA,
    indexInBlock: 2,
    field3: 'field3',
    complexField: ce,
  })

  await Promise.all([store.save(a), store.save(b), store.save(c)])
  console.log(`Loaded events`)
}

export async function jsonFieldLoader({ store }: BlockContext & StoreContext) {
  const e = new SystemEvent()
  const params = new EventParam()
  const additionalData = new AdditionalData()

  additionalData.data = Buffer.from(`0x000`)

  params.name = 'account'
  params.type = 'string'
  params.value = '0x000'
  params.additionalData = [additionalData]

  e.params = params
  e.arrayField = ['aaa', 'bbb', 'ccc']
  await store.save(e)
}

async function issueLoader({ store }: StoreContext) {
  const issue1 = new Issue({ id: '1' })
  const issue2 = new Issue({ id: '2' })
  await store.save(issue1)
  await store.save(issue2)

  const issue1Payment = new IssuePayment()
  issue1Payment.id = '1'
  issue1Payment.issue = issue1
  issue1Payment.amount = 10
  await store.save(issue1Payment)

  const issue2Cancellation = new IssueCancellation()
  issue2Cancellation.id = '2'
  issue2Cancellation.issue = issue2
  issue2Cancellation.block = 100
  await store.save(issue2Cancellation)
}
