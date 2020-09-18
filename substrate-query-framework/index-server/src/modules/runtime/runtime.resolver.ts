import { Arg, Args, Mutation, Query, Resolver } from "type-graphql";
import { Inject } from "typedi";
import { Fields, StandardDeleteResponse, UserId } from "warthog";

import {
  RuntimeCreateInput,
  RuntimeCreateManyArgs,
  RuntimeUpdateArgs,
  RuntimeWhereArgs,
  RuntimeWhereInput,
  RuntimeWhereUniqueInput
} from "../../../generated";

import { Runtime } from "./runtime.model";
import { RuntimeService } from "./runtime.service";

@Resolver(Runtime)
export class RuntimeResolver {
  constructor(
    @Inject("RuntimeService") public readonly service: RuntimeService
  ) {}

  @Query(() => [Runtime])
  async runtimes(
    @Args() { where, orderBy, limit, offset }: RuntimeWhereArgs,
    @Fields() fields: string[]
  ): Promise<Runtime[]> {
    return this.service.find<RuntimeWhereInput>(
      where,
      orderBy,
      limit,
      offset,
      fields
    );
  }

  @Query(() => Runtime)
  async runtime(
    @Arg("where") where: RuntimeWhereUniqueInput
  ): Promise<Runtime> {
    return this.service.findOne<RuntimeWhereUniqueInput>(where);
  }

  @Mutation(() => Runtime)
  async createRuntime(
    @Arg("data") data: RuntimeCreateInput,
    @UserId() userId: string
  ): Promise<Runtime> {
    return this.service.create(data, userId);
  }

  @Mutation(() => [Runtime])
  async createManyRuntimes(
    @Args() { data }: RuntimeCreateManyArgs,
    @UserId() userId: string
  ): Promise<Runtime[]> {
    return this.service.createMany(data, userId);
  }

  @Mutation(() => Runtime)
  async updateRuntime(
    @Args() { data, where }: RuntimeUpdateArgs,
    @UserId() userId: string
  ): Promise<Runtime> {
    return this.service.update(data, where, userId);
  }

  @Mutation(() => StandardDeleteResponse)
  async deleteRuntime(
    @Arg("where") where: RuntimeWhereUniqueInput,
    @UserId() userId: string
  ): Promise<StandardDeleteResponse> {
    return this.service.delete(where, userId);
  }
}
