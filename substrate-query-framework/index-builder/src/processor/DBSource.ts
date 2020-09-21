import { IProcessorSource, EventFilter } from './IProcessorSource';
import { SubstrateEvent } from '../model';
import { getRepository, MoreThan, In, LessThanOrEqual, FindConditions } from 'typeorm';
import { SubstrateEventEntity } from '../entities';
import { Inject, Service } from 'typedi';
import { IndexerStatusService } from '../indexer';

@Service('ProcessorSource')
export class DBSource implements IProcessorSource {
  

  constructor(@Inject() protected indexerService: IndexerStatusService = new IndexerStatusService()) {}

  async nextBatch(filter: EventFilter, size: number): Promise<SubstrateEvent[]> {
    const indexerHead = await this.indexerService.getIndexerHead(); 
    const where: FindConditions<SubstrateEventEntity>[]= [{
      name: In(filter.names),
      blockNumber: LessThanOrEqual(indexerHead)
    }]

    if (filter.afterID) {
      where.push({ id: MoreThan(filter.afterID) });
    }

    const eventEntities:SubstrateEventEntity[] = await getRepository(SubstrateEventEntity).find({ 
      relations: ["extrinsic"],
      where,
      order: {
        id: 'ASC'
      },
      take: size
    })
    return eventEntities.map(e => this.convert(e));
  }

  private convert(qee: SubstrateEventEntity): SubstrateEvent {
    return qee as SubstrateEvent;
  }
  
}