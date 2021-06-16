import { SubstrateEvent } from '@joystream/hydra-common'

export namespace Balances {
  export class TransferEvent {
    constructor(public readonly ctx: SubstrateEvent) {}

    get testProp(): string {
      return 'TestProp'
    }
  }
}
