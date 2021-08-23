import { Query, ObjectType, Field, Resolver } from 'type-graphql'

@ObjectType()
export class Hello {
  @Field(() => String, { nullable: false })
  greeting!: string

  constructor(greeting: string) {
    this.greeting = greeting
  }
}

@Resolver()
export class ShallowResolver {
  @Query(() => Hello)
  async shallowHello(): Promise<Hello> {
    return new Hello('Hello world')
  }
}
