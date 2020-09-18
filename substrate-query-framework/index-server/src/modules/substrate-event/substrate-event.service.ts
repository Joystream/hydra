import { Service } from 'typedi'
import { Repository, createQueryBuilder, getConnection } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { BaseService, RelayPageOptionsInput, ConnectionResult } from 'warthog'
import { SubstrateEvent } from './substrate-event.model'
import { SubstrateExtrinsic } from '../substrate-extrinsic/substrate-extrinsic.model'
import { SubstrateEventWhereInput } from '../../../generated'
import { getIndexerHead } from '@dzlzv/hydra-indexer-lib/lib/db/dal'
import { ConnectionInputFields } from 'warthog/dist/types/core/GraphQLInfoService'
import Debug from 'debug'

const debug = Debug('index-server:event-server')

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

  async findConnection<W extends SubstrateEventWhereInput>(
    whereInput?: W, // V3: WhereExpression = {},
    orderBy?: string | string[],
    pageOptions?: RelayPageOptionsInput,
    fields?: ConnectionInputFields
  ): Promise<ConnectionResult<SubstrateEvent>> {
    // TODO: inject current indexer head from Redis
    // const indexerHead = await getIndexerHead()
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const _whereInput = whereInput || ({} as W)
    // _whereInput.blockNumber_lte = indexerHead
    return super.findConnection(whereInput, orderBy, pageOptions, fields)
  }
}
