import { Resolver, Field, ObjectType, Int, Query } from 'type-graphql'
import { IndexerStatusService } from './indexer-status.service'
import { Inject } from 'typedi'

@ObjectType()
export class IndexerStatus {
  @Field(() => Int, { nullable: false })
  head!: number

  @Field(() => Int, { nullable: false })
  lastComplete!: number

  @Field(() => Int, { nullable: false })
  maxComplete!: number

  @Field(() => Int, { nullable: false })
  chainHeight!: number
}

@Resolver(IndexerStatus)
export class IndexerStatusResolver {
  constructor(
    @Inject('IndexerStatusService')
    public readonly service: IndexerStatusService
  ) {}

  @Query(() => IndexerStatus)
  async indexerStatus(): Promise<IndexerStatus> {
    return this.service.currentStatus()
  }
}
