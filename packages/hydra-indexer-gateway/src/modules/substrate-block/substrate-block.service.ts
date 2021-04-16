import { BaseService } from 'warthog'
import { Service } from 'typedi'
import { SubstrateBlock } from './substrate-block.model'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { SubstrateBlockWhereInputAugmented } from './substrate-block.resolver'
import { omit } from 'lodash'

@Service('SubstrateBlockService')
export class SubstrateBlockService extends BaseService<SubstrateBlock> {
  constructor(
    @InjectRepository(SubstrateBlock)
    protected readonly repository: Repository<SubstrateBlock>
  ) {
    super(SubstrateBlock, repository)
  }

  async findWithNames(
    where: SubstrateBlockWhereInputAugmented = {},
    orderBy = 'id_DESC',
    limit = 50,
    fields: string[]
  ): Promise<SubstrateBlock[]> {
    const whereStripped = omit(where, ['events_some', 'extrinsic_some'])

    let qb = this.buildFindQuery(
      whereStripped as any,
      orderBy,
      { limit },
      fields
    )

    if (where.events_some && where.events_some.name_in) {
      const { whereClause, params } = this.jsonArrayOptions(
        'events',
        'name',
        where.events_some.name_in,
        'event_name_key'
      )
      qb = qb.andWhere(whereClause, params)
    }

    if (where.extrinsics_some && where.extrinsics_some.name_in) {
      const { whereClause, params } = this.jsonArrayOptions(
        'extrinsics',
        'name',
        where.extrinsics_some.name_in,
        'extrinsic_name_key'
      )
      qb = qb.andWhere(whereClause, params)
    }

    return qb.getMany()
  }

  jsonArrayOptions(
    field: string,
    key: string,
    options: string[],
    paramKey: string
  ): { whereClause: string; params: { [key: string]: string } } {
    const column = `${this.attrToDBColumn(field)}`

    const whereClause = options.reduce((acc, _, index) => {
      const clause = `${column} @> :${paramKey}${index}::jsonb`
      return index === 0 ? `${acc}${clause}` : `${acc} OR ${clause}`
    }, '')

    const params = options.reduce((acc, option, index) => {
      const tmp = {} as any
      tmp[key] = option
      // this will sanitize all nasty characters
      acc[`${paramKey}${index}`] = `${JSON.stringify([tmp])}`
      return acc
    }, {} as { [key: string]: string })

    return { whereClause, params }
  }
}
