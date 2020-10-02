import { SubstrateEvent } from '../model';


export interface EventFilter {
  afterID?: string
  names: string[]
  fromBlock: number
  toBlock: number
}

export interface IProcessorSource {
  
  nextBatch(filter: EventFilter, limit: number): Promise<SubstrateEvent[]>;

  indexerHead(): Promise<number>;
}