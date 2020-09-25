import { SubstrateEvent } from '../model';


export interface EventFilter {
  afterID?: string
  names: string[]
}

export interface IProcessorSource {
  
  nextBatch(filter: EventFilter, limit: number): Promise<SubstrateEvent[]>;

}