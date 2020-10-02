import { SubstrateEvent } from '../model';
import { EventEmitter } from 'typeorm/platform/PlatformTools';


export interface EventFilter {
  afterID?: string
  names: string[]
  fromBlock: number
  toBlock: number
}

export interface IProcessorSource extends EventEmitter {
  
  nextBatch(filter: EventFilter, limit: number): Promise<SubstrateEvent[]>;

  indexerHead(): Promise<number>;

  subscribe(events: string[]): Promise<void>;
}