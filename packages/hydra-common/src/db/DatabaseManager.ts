import { DeepPartial } from './DeepPartial'

/**
 * Database access interface. Use typeorm transactional entity manager to perform get/save/remove operations.
 */
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
  get<T, TFindOptions>(
    entity: { new (...args: any[]): T },
    options: TFindOptions
  ): Promise<T | undefined>

  /**
   * Finds entities that match given options.
   * @param entity: T
   * @param options: FindOneOptions<T>
   */
  getMany<T, TFindOptions>(
    entity: { new (...args: any[]): T },
    options: TFindOptions
  ): Promise<T[]>
}
