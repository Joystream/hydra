import { Service } from 'typedi'
import { Repository, createQueryBuilder } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { BaseService, RelayPageOptionsInput, ConnectionResult } from 'warthog'
import { SubstrateEvent } from './substrate-event.model'
import { SubstrateExtrinsic } from '../substrate-extrinsic/substrate-extrinsic.model'
import { SubstrateEventWhereInput } from '../../../generated'
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
    return createQueryBuilder(SubstrateExtrinsic, 'extrinsic')
      .innerJoin('extrinsic.event', 'event')
      .where('event.id = :id', { id: eventID })
      .getOne()
  }

  async findAfter<W extends SubstrateEventWhereInput>(
    where: any = {}, // V3: WhereExpression = {},
    after?: string,
    limit?: number,
    fields?: string[]
  ): Promise<SubstrateEvent[]> {
    limit = limit ?? 20
    if (after) {
      where = { ...where, AND: [{ 'id_gt': after }] }
    }
    return this.buildFindQuery<W>(where, 'id_ASC', { limit }, fields).getMany()
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

    const emptyResult: ConnectionResult<SubstrateEvent> = {
      totalCount: 0,
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: '',
      },
    }

    let result
    try {
      result = await super.findConnection(
        whereInput,
        orderBy,
        pageOptions,
        fields
      )
    } catch (e) {
      // HACK around https://github.com/goldcaddy77/warthog/blob/b4649819be8b9af1627f2261532fcae6140246a2/src/core/RelayService.ts#L89
      if (e && e.message === 'Items is empty') {
        return emptyResult
      }
      throw e
    }
    return result
  }
}
