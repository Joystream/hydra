import { ExtrinsicContext, EventContext, StoreContext } from '@subsquid/hydra-common'

export async function eventHandler({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext): Promise<void> {

}