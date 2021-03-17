import { IStateKeeper } from './IStateKeeper'
import { StateKeeper } from './StateKeeper'

export * from './IStateKeeper'
export * from './StateKeeper'

let stateKeeper: StateKeeper

export async function getStateKeeper(): Promise<IStateKeeper> {
  if (!stateKeeper) {
    stateKeeper = new StateKeeper()
    await stateKeeper.init()
  }
  return stateKeeper
}
