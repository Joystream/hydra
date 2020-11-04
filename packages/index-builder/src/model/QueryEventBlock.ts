// import { BlockNumber } from '@polkadot/types/interfaces';
import { IQueryEvent } from './'

export class QueryEventBlock {
  readonly blockNumber: number

  readonly queryEvents: IQueryEvent[]

  constructor(blockNumber: number, queryEvents: IQueryEvent[]) {
    this.blockNumber = blockNumber
    this.queryEvents = queryEvents
  }
}
