/**
 *  TypeORM interfaces. Extracted into a separate file in order to avoid typeorm dependency
 */

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
export declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> | T[P]
}

/**
 * Interface of the simple literal object with any string keys.
 */
export interface ObjectLiteral {
  [key: string]: any
}

/**
 * Used to specify what entity relations should be loaded.
 *
 * Example:
 *  const options: JoinOptions = {
 *     alias: "photo",
 *     leftJoin: {
 *         author: "photo.author",
 *         categories: "categories",
 *         user: "categories.user",
 *         profile: "user.profile"
 *     },
 *     innerJoin: {
 *         author: "photo.author",
 *         categories: "categories",
 *         user: "categories.user",
 *         profile: "user.profile"
 *     },
 *     leftJoinAndSelect: {
 *         author: "photo.author",
 *         categories: "categories",
 *         user: "categories.user",
 *         profile: "user.profile"
 *     },
 *     innerJoinAndSelect: {
 *         author: "photo.author",
 *         categories: "categories",
 *         user: "categories.user",
 *         profile: "user.profile"
 *     }
 * };
 */
export interface JoinOptions {
  /**
   * Alias of the main entity.
   */
  alias: string
  /**
   * Object where each key represents the LEFT JOIN alias,
   * and the corresponding value represents the relation path.
   *
   * The columns of the joined table are included in the selection.
   */
  leftJoinAndSelect?: {
    [key: string]: string
  }
  /**
   * Object where each key represents the INNER JOIN alias,
   * and the corresponding value represents the relation path.
   *
   * The columns of the joined table are included in the selection.
   */
  innerJoinAndSelect?: {
    [key: string]: string
  }
  /**
   * Object where each key represents the LEFT JOIN alias,
   * and the corresponding value represents the relation path.
   *
   * This method does not select the columns of the joined table.
   */
  leftJoin?: {
    [key: string]: string
  }
  /**
   * Object where each key represents the INNER JOIN alias,
   * and the corresponding value represents the relation path.
   *
   * This method does not select the columns of the joined table.
   */
  innerJoin?: {
    [key: string]: string
  }
}

/**
 * Used for find operations.
 */
export declare type FindConditions<T> = {
  [P in keyof T]?: T[P] extends never
    ? FindConditions<T[P]> | FindOperator<FindConditions<T[P]>>
    : FindConditions<T[P]> | FindOperator<FindConditions<T[P]>>
}

/**
 * Find Operator used in Find Conditions.
 */
export declare class FindOperator<T> {
  /**
   * Operator type.
   */
  private _type
  /**
   * Parameter value.
   */
  private _value
  /**
   * ObjectLiteral parameters.
   */
  private _objectLiteralParameters
  /**
   * Indicates if parameter is used or not for this operator.
   */
  private _useParameter
  /**
   * Indicates if multiple parameters must be used for this operator.
   */
  private _multipleParameters
  /**
   * SQL generator
   */
  private _getSql
  constructor(
    type: FindOperatorType,
    value: T | FindOperator<T>,
    useParameter?: boolean,
    multipleParameters?: boolean,
    getSql?: SqlGeneratorType,
    objectLiteralParameters?: ObjectLiteral
  )

  /**
   * Indicates if parameter is used or not for this operator.
   * Extracts final value if value is another find operator.
   */
  get useParameter(): boolean

  /**
   * Indicates if multiple parameters must be used for this operator.
   * Extracts final value if value is another find operator.
   */
  get multipleParameters(): boolean

  /**
   * Gets the Type of this FindOperator
   */
  get type(): string

  /**
   * Gets the final value needs to be used as parameter value.
   */
  get value(): T

  /**
   * Gets ObjectLiteral parameters.
   */
  get objectLiteralParameters(): ObjectLiteral | undefined

  /**
   * Gets the child FindOperator if it exists
   */
  get child(): FindOperator<T> | undefined

  /**
   * Gets the SQL generator
   */
  get getSql(): SqlGeneratorType | undefined
}

declare type SqlGeneratorType = (aliasPath: string) => string

/**
 * List of types that FindOperator can be.
 */
export declare type FindOperatorType =
  | 'not'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'moreThan'
  | 'moreThanOrEqual'
  | 'equal'
  | 'between'
  | 'in'
  | 'any'
  | 'isNull'
  | 'ilike'
  | 'like'
  | 'raw'

/**
 * Defines a special criteria to find specific entity.
 */
export interface FindOneOptions<Entity = any> {
  /**
   * Specifies what columns should be retrieved.
   */
  select?: (keyof Entity)[]
  /**
   * Simple condition that should be applied to match entities.
   */
  where?:
    | FindConditions<Entity>[]
    | FindConditions<Entity>
    | ObjectLiteral
    | string
  /**
   * Indicates what relations of entity should be loaded (simplified left join form).
   */
  relations?: string[]
  /**
   * Specifies what relations should be loaded.
   */
  join?: JoinOptions
  /**
   * Order, in which entities should be ordered.
   */
  order?: {
    [P in EntityFieldsNames<Entity>]?: 'ASC' | 'DESC' | 1 | -1
  }
  /**
   * Enables or disables query result caching.
   */
  cache?:
    | boolean
    | number
    | {
        id: any
        milliseconds: number
      }
  /**
   * Indicates what locking mode should be used.
   *
   * Note: For lock tables, you must specify the table names and not the relation names
   */
  lock?:
    | {
        mode: 'optimistic'
        version: number | Date
      }
    | {
        mode:
          | 'pessimistic_read'
          | 'pessimistic_write'
          | 'dirty_read'
          | 'pessimistic_partial_write'
          | 'pessimistic_write_or_fail'
          | 'for_no_key_update'
        tables?: string[]
      }
  /**
   * Indicates if soft-deleted rows should be included in entity result.
   */
  withDeleted?: boolean
  /**
   * If sets to true then loads all relation ids of the entity and maps them into relation values (not relation objects).
   * If array of strings is given then loads only relation ids of the given properties.
   */
  loadRelationIds?:
    | boolean
    | {
        relations?: string[]
        disableMixedMap?: boolean
      }
  /**
   * Indicates if eager relations should be loaded or not.
   * By default they are loaded when find methods are used.
   */
  loadEagerRelations?: boolean
  /**
   * If this is set to true, SELECT query in a `find` method will be executed in a transaction.
   */
  transaction?: boolean
}

/**
 * Defines a special criteria to find specific entities.
 */
export interface FindManyOptions<Entity = any> extends FindOneOptions<Entity> {
  /**
   * Offset (paginated) where from entities should be taken.
   */
  skip?: number
  /**
   * Limit (paginated) - max number of entities should be taken.
   */
  take?: number
}

/**
 * Interface of the entity fields names only (without functions)
 */
export declare type EntityFieldsNames<Entity = any> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof Entity]: Entity[P] extends Function ? never : P
}[keyof Entity]
