import {
  DatabaseManager,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  FindConditions,
  EntityConstructor,
} from '@subsquid/hydra-common'
import { EntityManager } from 'typeorm'

/**
 * Wrap TypeORM EM into a database manager.
 * @param entityManager EntityManager
 */
export function makeDatabaseManager(
  entityManager: EntityManager
): DatabaseManager {
  return {
    save: async <Entity extends ObjectLiteral>(
      entity: DeepPartial<Entity>
    ): Promise<void> => {
      await entityManager.save(entity)
    },

    remove: async <Entity extends ObjectLiteral>(
      entity: DeepPartial<Entity>
    ): Promise<void> => {
      await entityManager.remove(entity)
    },

    get: <Entity extends ObjectLiteral>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entity: EntityConstructor<Entity>,
      options: FindOneOptions<Entity>
    ): Promise<Entity | undefined> => {
      return entityManager.findOne(entity, options)
    },

    getMany: <Entity extends ObjectLiteral>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entity: EntityConstructor<Entity>,
      options: FindManyOptions<Entity>
    ): Promise<Entity[]> => {
      return entityManager.find(entity, options)
    },

    find: <Entity extends ObjectLiteral>(
      entityClass: EntityConstructor<Entity>,
      optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>
    ): Promise<Entity[]> => {
      return entityManager.find(entityClass, optionsOrConditions)
    },

    /**
     * Finds first entity that matches given conditions.
     */
    findOneOrFail: <Entity extends ObjectLiteral>(
      entityClass: EntityConstructor<Entity>,
      optionsOrConditions?:
        | string
        | number
        | Date
        | FindOneOptions<Entity>
        | FindConditions<Entity>,
      maybeOptions?: FindOneOptions<Entity>
    ): Promise<Entity> => {
      return entityManager.findOneOrFail(
        entityClass,
        optionsOrConditions,
        maybeOptions
      )
    },

    /**
     * Executes a raw SQL query and returns a raw database results.
     * Raw query execution is supported only by relational databases (MongoDB is not supported).
     */
    query: (query: string, parameters?: any[]): Promise<any> => {
      return entityManager.query(query, parameters)
    },

    /**
     * Finds first entity that matches given conditions.
     */
    findOne: <Entity extends ObjectLiteral>(
      entityClass: EntityConstructor<Entity>,
      optionsOrConditions?:
        | string
        | number
        | Date
        | FindOneOptions<Entity>
        | FindConditions<Entity>,
      maybeOptions?: FindOneOptions<Entity>
    ): Promise<Entity | undefined> => {
      return entityManager.findOne(
        entityClass,
        optionsOrConditions,
        maybeOptions
      )
    },

    /**
     * Finds entities that match given find options or conditions.
     * Also counts all entities that match given conditions,
     * but ignores pagination settings (from and take options).
     */
    findAndCount: <Entity extends ObjectLiteral>(
      entityClass: EntityConstructor<Entity>,
      optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity>
    ): Promise<[Entity[], number]> => {
      return entityManager.findAndCount(entityClass, optionsOrConditions)
    },
  }
}
