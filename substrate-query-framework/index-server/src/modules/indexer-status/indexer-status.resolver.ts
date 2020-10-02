import { Resolver, Field, ObjectType, Int, Query } from 'type-graphql'
import { IndexerStatusService } from './indexer-status.service'
import { Inject } from 'typedi'

@ObjectType()
export class IndexerStatus {
  @Field(() => Int, { nullable: false })
  head!: number
  // TODO: more indexer metrics
}

@Resolver(IndexerStatus)
export class IndexerStatusResolver {
  constructor(
    @Inject('IndexerStatusService')
    public readonly service: IndexerStatusService
  ) {}

  @Query(() => IndexerStatus)
  async indexerStatus(): Promise<IndexerStatus> {
    const head = await this.service.currentIndexerHead()
    return { head } as IndexerStatus
  }
}
