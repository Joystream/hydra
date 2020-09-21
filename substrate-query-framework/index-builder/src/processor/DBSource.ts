import { IProcessorSource, EventFilter } from './IProcessorSource';
import { SubstrateEvent, EventParameters } from '../model';
import { getRepository, MoreThan, In, LessThanOrEqual } from 'typeorm';
import { SubstrateEventEntity } from '../entities';
import { Inject, Service } from 'typedi';
import { IndexerStatusService } from '../indexer';
import { Codec } from '@polkadot/types/types';

@Service('ProcessorSource')
export class DBSource implements IProcessorSource {
  

  constructor(@Inject() protected indexerService: IndexerStatusService = new IndexerStatusService()) {}

  async nextBatch(filter: EventFilter, size: number): Promise<SubstrateEvent[]> {
    const indexerHead = await this.indexerService.getIndexerHead(); 
    const eventEntities:SubstrateEventEntity[] = await getRepository(SubstrateEventEntity).find({ 
      relations: ["extrinsic"],
      where: [
        {
          id: MoreThan(filter.afterID),
          name: In(filter.names),
          blockNumber: LessThanOrEqual(indexerHead)
        }],
      order: {
        id: 'ASC'
      },
      take: size
    })
    return eventEntities.map(e => this.convert(e));
  }

  private convert(qee: SubstrateEventEntity): SubstrateEvent {
    const event_params: EventParameters = {};
    qee.params.map((v) => { event_params[v.type] = (v.value as unknown) as Codec });
    return {
      event_name: qee.name,
      event_method: qee.method,
      event_params,
      id: qee.id,
      index: qee.index,
      block_number: qee.blockNumber,
      extrinsic: qee.extrinsic
    } as SubstrateEvent;
  }
  
}