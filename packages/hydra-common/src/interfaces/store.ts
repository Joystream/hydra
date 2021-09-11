import {
  DeepPartial,
  ObjectLiteral,
  FindManyOptions,
  FindOneOptions,
  FindConditions,
} from './typeorm'

export interface DatabaseManager {
  /**
   * Save given entity instance, if entity is exists then just update
   * @param entity
   */
  save<Entity extends ObjectLiteral>(entity: DeepPartial<Entity>): Promise<void>

  /**
   * Removes a given entity from the database.
   * @param entity: DeepPartial<T>
   */
  remove<Entity extends ObjectLiteral>(
    entity: DeepPartial<Entity>
  ): Promise<void>

  /**
   * Finds first entity that matches given options.
   * @param entity: T
   * @param options: FindOneOptions<T>
   */
  get<Entity extends ObjectLiteral>(
    entity: EntityConstructor<Entity>,
    options: FindOneOptions<Entity>
  ): Promise<Entity | undefined>

  /**
   * Finds entities that match given find options or conditions.
   */
  find<Entity extends ObjectLiteral>(
    entityClass: EntityConstructor<Entity>,
    options?: FindManyOptions<Entity>
  ): Promise<Entity[]>

  /**
   * Finds first entity that matches given conditions.
   */
  findOneOrFail<Entity extends ObjectLiteral>(
    entityClass: EntityConstructor<Entity>,
    optionsOrConditions?:
      | string
      | number
      | Date
      | FindOneOptions<Entity>
      | FindConditions<Entity>,
    maybeOptions?: FindOneOptions<Entity>
  ): Promise<Entity>

  /**
   * Executes a raw SQL query and returns a raw database results.
   * Raw query execution is supported only by relational databases (MongoDB is not supported).
   */
  query(query: string, parameters?: any[]): Promise<any>

  /**
   * Finds first entity that matches given conditions.
   */
  findOne<Entity extends ObjectLiteral>(
    entityClass: EntityConstructor<Entity>,
    optionsOrConditions?:
      | string
      | number
      | Date
      | FindOneOptions<Entity>
      | FindConditions<Entity>,
    maybeOptions?: FindOneOptions<Entity>
  ): Promise<Entity | undefined>

  /**
   * Finds entities that match given find options or conditions.
   * Also counts all entities that match given conditions,
   * but ignores pagination settings (from and take options).
   */
  findAndCount<Entity extends ObjectLiteral>(
    entityClass: EntityConstructor<Entity>,
    optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>
  ): Promise<[Entity[], number]>

  /**
   * Finds entities that match given options.
   * @param entity: T
   * @param options: FindOneOptions<T>
   */
  getMany<Entity extends ObjectLiteral>(
    entity: EntityConstructor<Entity>,
    options: FindManyOptions<Entity>
  ): Promise<Entity[]>
}

export type EntityConstructor<T> = {
  new (...args: any[]): T
}
