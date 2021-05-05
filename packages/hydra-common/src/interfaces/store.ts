import { DeepPartial, FindOneOptions } from './typeorm'

export interface DatabaseManager {
  /**
   * Save given entity instance, if entity is exists then just update
   * @param entity
   */
  save<T>(entity: DeepPartial<T>): Promise<void>

  /**
   * Removes a given entity from the database.
   * @param entity: DeepPartial<T>
   */
  remove<T>(entity: DeepPartial<T>): Promise<void>

  /**
   * Finds first entity that matches given options.
   * @param entity: T
   * @param options: FindOneOptions<T>
   */
  get<T>(
    entity: { new (...args: any[]): T },
    options: FindOneOptions<T>
  ): Promise<T | undefined>

  /**
   * Finds entities that match given options.
   * @param entity: T
   * @param options: FindOneOptions<T>
   */
  getMany<T>(
    entity: { new (...args: any[]): T },
    options: FindOneOptions<T>
  ): Promise<T[]>
}
