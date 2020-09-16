import { Service } from 'typedi'
import { Repository, createQueryBuilder } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { BaseService } from 'warthog'
import { SubstrateEvent } from './substrate-event.model'
import { SubstrateExtrinsic } from '../substrate-extrinsic/substrate-extrinsic.model'

@Service('SubstrateEventService')
export class SubstrateEventService extends BaseService<SubstrateEvent> {
  constructor(
    @InjectRepository(SubstrateEvent)
    protected readonly repository: Repository<SubstrateEvent>
  ) {
    super(SubstrateEvent, repository)
  }

  async getExtrinsic(eventID: string): Promise<SubstrateExtrinsic | undefined> {
    const extrinsic = await createQueryBuilder(SubstrateExtrinsic, 'extrinsic')
      .innerJoin('extrinsic.event', 'event')
      .where('event.id = :id', { id: eventID })
      .getOne()

    return extrinsic
  }
}
