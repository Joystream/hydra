
/**
 *  TypeORM interfaces. Extracted into a separate file in order to avoid typeorm dependency
 */

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
/*
export declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> | T[P]
}
*/

/* Full interface - causes errors in processor build
export declare type DeepPartial<T> = T | (T extends Array<infer U> ? DeepPartial<U>[] : T extends Map<infer K, infer V> ? Map<DeepPartial<K>, DeepPartial<V>> : T extends Set<infer M> ? Set<DeepPartial<M>> : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T);
*/
export declare type DeepPartial<T> = T | (T extends Array<infer U> ? DeepPartial<U>[] : T extends Map<infer K, infer V> ? Map<DeepPartial<K>, DeepPartial<V>> : T extends Set<infer M> ? Set<DeepPartial<M>> : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T);

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
 * /
export declare type FindConditions<T> = {
  [P in keyof T]?: T[P] extends never
    ? FindConditions<T[P]> | FindOperator<FindConditions<T[P]>>
    : FindConditions<T[P]> | FindOperator<FindConditions<T[P]>>
}
*/

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
 * Create a new ObjectID instance.
 *
 * @see http://mongodb.github.io/node-mongodb-native/2.1/api/ObjectID.html
 */
export declare class ObjectID {
    constructor(s?: string | number);
    /**
     * The generation time of this ObjectId instance.
     */
    generationTime: number;
    /**
     * Creates an ObjectID from a hex string representation of an ObjectID.
     */
    static createFromHexString(hexString: string): ObjectID;
    /**
     * Creates an ObjectID from a second based number, with the rest of the ObjectID zeroed out. Used for comparisons or sorting the ObjectID.
     */
    static createFromTime(time: number): ObjectID;
    /**
     * Checks if a value is a valid bson ObjectId.
     */
    static isValid(id: any): boolean;
    /**
     * Compares the equality of this ObjectID with otherID.
     */
    equals(otherID: ObjectID): boolean;
    /**
     * Generate a 12 byte id buffer used in ObjectID's.
     */
    generate(time?: number): string;
    /**
     * Returns the generation date (accurate up to the second) that this ID was generated.
     *
     */
    getTimestamp(): Date;
    /**
     * Return the ObjectID id as a 24 byte hex string representation.
     */
    toHexString(): string;
    /**
     * Get the timestamp and validate correctness.
     */
    toString(): string;
}

/**
 * A single property handler for FindOptionsSelect.
 */
export declare type FindOptionsSelectProperty<Property> = Property extends Promise<infer I> ? FindOptionsSelectProperty<I> | boolean : Property extends Array<infer I> ? FindOptionsSelectProperty<I> | boolean : Property extends Function ? never : Property extends Buffer ? boolean : Property extends Date ? boolean : Property extends ObjectID ? boolean : Property extends object ? FindOptionsSelect<Property> : boolean;

/**
 * Select find options.
 */
export declare type FindOptionsSelect<Entity> = {
    [P in keyof Entity]?: FindOptionsSelectProperty<NonNullable<Entity[P]>>;
};

/**
 * Property paths (column names) to be selected by "find" defined as string.
 * Old selection mechanism in TypeORM.
 *
 * @deprecated will be removed in the next version, use FindOptionsSelect type notation instead
 */
export declare type FindOptionsSelectByString<Entity> = (keyof Entity)[];

/**
 * A single property handler for FindOptionsRelations.
 */
export declare type FindOptionsRelationsProperty<Property> = Property extends Promise<infer I> ? FindOptionsRelationsProperty<NonNullable<I>> | boolean : Property extends Array<infer I> ? FindOptionsRelationsProperty<NonNullable<I>> | boolean : Property extends Function ? never : Property extends Buffer ? never : Property extends Date ? never : Property extends ObjectID ? never : Property extends object ? FindOptionsRelations<Property> | boolean : boolean;
/**
 * Relations find options.
 */
export declare type FindOptionsRelations<Entity> = {
    [P in keyof Entity]?: FindOptionsRelationsProperty<NonNullable<Entity[P]>>;
};
/**
 * Relation names to be selected by "relation" defined as string.
 * Old relation mechanism in TypeORM.
 *
 * @deprecated will be removed in the next version, use FindOptionsRelation type notation instead
 */
export declare type FindOptionsRelationByString = string[];

/**
 * A single property handler for FindOptionsWere.
 */
export declare type FindOptionsWhereProperty<Property> = Property extends Promise<infer I> ? FindOptionsWhereProperty<NonNullable<I>> : Property extends Array<infer I> ? FindOptionsWhereProperty<NonNullable<I>> : Property extends Function ? never : Property extends Buffer ? Property | FindOperator<Property> : Property extends Date ? Property | FindOperator<Property> : Property extends ObjectID ? Property | FindOperator<Property> : Property extends object ? FindOptionsWhere<Property> | FindOptionsWhere<Property>[] | EqualOperator<Property> | FindOperator<any> | boolean : Property | FindOperator<Property>;
/** :
 * Used for find operations.
 */
export declare type FindOptionsWhere<Entity> = {
    [P in keyof Entity]?: FindOptionsWhereProperty<NonNullable<Entity[P]>>;
};

export declare class EqualOperator<T> extends FindOperator<T> {
    readonly "@instanceof": symbol;
    constructor(value: T | FindOperator<T>);
}

/**
 * A single property handler for FindOptionsOrder.
 */
export declare type FindOptionsOrderProperty<Property> = Property extends Promise<infer I> ? FindOptionsOrderProperty<NonNullable<I>> : Property extends Array<infer I> ? FindOptionsOrderProperty<NonNullable<I>> : Property extends Function ? never : Property extends Buffer ? FindOptionsOrderValue : Property extends Date ? FindOptionsOrderValue : Property extends ObjectID ? FindOptionsOrderValue : Property extends object ? FindOptionsOrder<Property> : FindOptionsOrderValue;
/**
 * Order by find options.
 */
export declare type FindOptionsOrder<Entity> = {
    [P in keyof Entity]?: FindOptionsOrderProperty<NonNullable<Entity[P]>>;
};

/**
 * Value of order by in find options.
 */
export declare type FindOptionsOrderValue = "ASC" | "DESC" | "asc" | "desc" | 1 | -1 | {
    direction?: "asc" | "desc" | "ASC" | "DESC";
    nulls?: "first" | "last" | "FIRST" | "LAST";
};

/**
 * Defines a special criteria to find specific entity.
 */
export interface FindOneOptions<Entity = any> {
  /**
   * Adds a comment with the supplied string in the generated query.  This is
   * helpful for debugging purposes, such as finding a specific query in the
   * database server's logs, or for categorization using an APM product.
   */
  comment?: string;
  /**
   * Specifies what columns should be retrieved.
   */
  select?: FindOptionsSelect<Entity> | FindOptionsSelectByString<Entity>;
  /**
   * Simple condition that should be applied to match entities.
   */
  where?: FindOptionsWhere<Entity>[] | FindOptionsWhere<Entity>;
  /**
   * Indicates what relations of entity should be loaded (simplified left join form).
   */
  relations?: FindOptionsRelations<Entity> | FindOptionsRelationByString;
  /**
   * Specifies how relations must be loaded - using "joins" or separate queries.
   * If you are loading too much data with nested joins it's better to load relations
   * using separate queries.
   *
   * Default strategy is "join", but default can be customized in connection options.
   */
  relationLoadStrategy?: "join" | "query";
  /**
   * Specifies what relations should be loaded.
   *
   * @deprecated
   */
  join?: JoinOptions;
  /**
   * Order, in which entities should be ordered.
   */
  order?: FindOptionsOrder<Entity>;
  /**
   * Enables or disables query result caching.
   */
  cache?: boolean | number | {
    id: any;
    milliseconds: number;
  };
  /**
   * Indicates what locking mode should be used.
   *
   * Note: For lock tables, you must specify the table names and not the relation names
   */
  lock?: {
    mode: "optimistic";
    version: number | Date;
  } | {
    mode: "pessimistic_read" | "pessimistic_write" | "dirty_read" | "pessimistic_partial_write" | "pessimistic_write_or_fail" | "for_no_key_update" | "for_key_share";
    tables?: string[];
  };
  /**
   * Indicates if soft-deleted rows should be included in entity result.
   */
  withDeleted?: boolean;
  /**
   * If sets to true then loads all relation ids of the entity and maps them into relation values (not relation objects).
   * If array of strings is given then loads only relation ids of the given properties.
   */
  loadRelationIds?: boolean | {
      relations?: string[];
      disableMixedMap?: boolean;
  };
  /**
   * Indicates if eager relations should be loaded or not.
   * By default, they are loaded when find methods are used.
   */
  loadEagerRelations?: boolean;
  /**
   * If this is set to true, SELECT query in a `find` method will be executed in a transaction.
   */
  transaction?: boolean;
}

/**
 * Interface of the entity fields names only (without functions)
 */
export declare type EntityFieldsNames<Entity = any> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof Entity]: Entity[P] extends Function ? never : P
}[keyof Entity]
