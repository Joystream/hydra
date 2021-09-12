import { Resolver, Field, ObjectType, Int, Query } from 'type-graphql'
import { IndexerStatusService } from './indexer-status.service'
import { Inject } from 'typedi'
import { Subscription } from 'type-graphql';

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

  @Field()
  inSync!: boolean

  @Field({ nullable: true })
  hydraVersion?: string
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

  @Subscription({
//    topics: (resolverTopicData) => {
//      console.log('debuuuuug', resolverTopicData)
//
//      return 'someString'
//    }
    topics: ({ args, payload, context }) => {
      console.log('dynamic topiccc', args.topic)
      return args.topic
    }
    /*
    subscribe: (root, args, context, info) => {
      console.log('subbbscribe has been called!', root, args, context, info)

      //return []
      return {
        [Symbol.asyncIterator]() {
          yield "hello";
        }
      }
    }*/
  })
  StatusSubscription(indexerStatus: IndexerStatus): IndexerStatus {
    return indexerStatus
  }

  //@Subscription({ topics: 'user:create' })
  //createUserSubscription(@Root() user: User): User {
  //  return user;
  //}
}


