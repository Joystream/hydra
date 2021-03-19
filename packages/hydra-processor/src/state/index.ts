import { IStateKeeper } from './IStateKeeper'
import { StateKeeper } from './StateKeeper'

export * from './IStateKeeper'
export * from './StateKeeper'

let stateKeeper: IStateKeeper

export const getStateKeeper: () => IStateKeeper = () => {
  if (!stateKeeper) {
    stateKeeper = new StateKeeper()
  }
  return stateKeeper
}
