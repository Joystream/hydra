import { Query, ObjectType, Field, Resolver } from 'type-graphql'

@ObjectType()
export class DeepHello {
  @Field(() => String, { nullable: false })
  greeting!: string

  constructor(greeting: string) {
    this.greeting = greeting
  }
}

@Resolver()
export class DeepResolver {
  @Query(() => DeepHello)
  async deepHello(): Promise<DeepHello> {
    return new DeepHello('Hello world')
  }
}
