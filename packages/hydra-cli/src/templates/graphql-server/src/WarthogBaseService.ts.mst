import { BaseService, BaseModel, WhereInput, LimitOffset, addQueryBuilderWhereItem } from 'warthog';
import { Brackets, SelectQueryBuilder } from 'typeorm';

type WhereExpression = {
  AND?: WhereExpression[];
  OR?: WhereExpression[];
} & WhereFilterAttributes;

interface WhereFilterAttributes {
  [key: string]: string | number | null;
}

export class WarthogBaseService<E extends BaseModel> extends BaseService<E> {
  buildFindQueryWithParams<W extends WhereInput>(
    where: WhereExpression = {},
    orderBy?: string | string[],
    pageOptions?: LimitOffset,
    fields?: string[],
    paramKeyPrefix: string = 'param',
    aliases: (field: string) => string | undefined = () => undefined
  ): SelectQueryBuilder<E> {
    const DEFAULT_LIMIT = 50;
    let qb = this.manager.createQueryBuilder<E>(this.entityClass, this.klass);
    if (!pageOptions) {
      pageOptions = {
        limit: DEFAULT_LIMIT,
      };
    }

    qb = qb.take(pageOptions.limit || DEFAULT_LIMIT);

    if (pageOptions.offset) {
      qb = qb.skip(pageOptions.offset);
    }

    if (fields) {
      // We always need to select ID or dataloaders will not function properly
      if (fields.indexOf('id') === -1) {
        fields.push('id');
      }
      // Querybuilder requires you to prefix all fields with the table alias.  It also requires you to
      // specify the field name using it's TypeORM attribute name, not the camel-cased DB column name
      qb = qb.select(`${this.klass}.id`, aliases('id'));
      fields.forEach(
        (field) => field !== 'id' && qb.addSelect(`${this.klass}.${field}`, aliases(field))
      );
    }

    qb = addOrderBy(orderBy, qb, (attr) => this.attrToDBColumn(attr));

    // Soft-deletes are filtered out by default, setting `deletedAt_all` is the only way to turn this off
    const hasDeletedAts = Object.keys(where).find((key) => key.indexOf('deletedAt_') === 0);
    // If no deletedAt filters specified, hide them by default
    if (!hasDeletedAts) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      where.deletedAt_eq = null; // Filter out soft-deleted items
    } else if (typeof where.deletedAt_all !== 'undefined') {
      // Delete this param so that it doesn't try to filter on the magic `all` param
      // Put this here so that we delete it even if `deletedAt_all: false` specified
      delete where.deletedAt_all;
    } else {
      // If we get here, the user has added a different deletedAt filter, like deletedAt_gt: <date>
      // do nothing because the specific deleted at filters will be added by processWhereOptions
    }

    // Keep track of a counter so that TypeORM doesn't reuse our variables that get passed into the query if they
    // happen to reference the same column
    const paramKeyCounter = { counter: 0 };
    const processWheres = (
      qb: SelectQueryBuilder<E>,
      where: WhereFilterAttributes
    ): SelectQueryBuilder<E> => {
      // where is of shape { userName_contains: 'a' }
      Object.keys(where).forEach((k: string) => {
        const paramKey = `${paramKeyPrefix}${paramKeyCounter.counter}`;
        // increment counter each time we add a new where clause so that TypeORM doesn't reuse our input variables
        paramKeyCounter.counter = paramKeyCounter.counter + 1;
        const key = k as keyof W; // userName_contains
        const parts = key.toString().split('_'); // ['userName', 'contains']
        const attr = parts[0]; // userName
        const operator = parts.length > 1 ? parts[1] : 'eq'; // contains

        return addQueryBuilderWhereItem(
          qb,
          paramKey,
          this.attrToDBColumn(attr),
          operator,
          where[key]
        );
      });
      return qb;
    };

    // WhereExpression comes in the following shape:
    // {
    //   AND?: WhereInput[];
    //   OR?: WhereInput[];
    //   [key: string]: string | number | null;
    // }
    const processWhereInput = (
      qb: SelectQueryBuilder<E>,
      where: WhereExpression
    ): SelectQueryBuilder<E> => {
      const { AND, OR, ...rest } = where;

      if (AND && AND.length) {
        const ands = AND.filter((value) => JSON.stringify(value) !== '{}');
        if (ands.length) {
          qb.andWhere(
            new Brackets((qb2) => {
              ands.forEach((where: WhereExpression) => {
                if (Object.keys(where).length === 0) {
                  return; // disregard empty where objects
                }
                qb2.andWhere(
                  new Brackets((qb3) => {
                    processWhereInput(qb3 as SelectQueryBuilder<any>, where);
                    return qb3;
                  })
                );
              });
            })
          );
        }
      }

      if (OR && OR.length) {
        const ors = OR.filter((value) => JSON.stringify(value) !== '{}');
        if (ors.length) {
          qb.andWhere(
            new Brackets((qb2) => {
              ors.forEach((where: WhereExpression) => {
                if (Object.keys(where).length === 0) {
                  return; // disregard empty where objects
                }

                qb2.orWhere(
                  new Brackets((qb3) => {
                    processWhereInput(qb3 as SelectQueryBuilder<any>, where);
                    return qb3;
                  })
                );
              });
            })
          );
        }
      }

      if (rest) {
        processWheres(qb, rest);
      }
      return qb;
    };

    if (Object.keys(where).length) {
      processWhereInput(qb, where);
    }

    return qb;
  }
}

export function addOrderBy<T>(
  orderBy: string | string[] | undefined,
  qb: SelectQueryBuilder<T>,
  attrToDBColumn: (attr: string) => string
): SelectQueryBuilder<T> {
  const [attrs, directions] = parseOrderBy(orderBy);

  if (attrs.length !== directions.length) {
    throw new Error('Number of attributes and sorting directions must match');
  }

  attrs.forEach((attr: string, index: number) => {
    qb = qb.addOrderBy(attrToDBColumn(attr), directions[index].toUpperCase() as 'ASC' | 'DESC');
  });
  return qb;
}

export function parseOrderBy(
  orderBy: string | string[] | undefined
): [string[], ('asc' | 'desc')[]] {
  const attrs: string[] = [];
  const directions: ('asc' | 'desc')[] = [];
  if (orderBy) {
    if (!Array.isArray(orderBy)) {
      orderBy = [orderBy];
    }

    orderBy.forEach((orderByItem: string) => {
      const parts = orderByItem.toString().split('_');
      // TODO: ensure attr is one of the properties on the model
      const attr = parts[0];
      const direction: 'asc' | 'desc' = parts[1].toLowerCase() as 'asc' | 'desc';

      attrs.push(attr);
      directions.push(direction);
    });
  }
  return [attrs, directions];
}

export function orderByFields(orderBy: string | string[] | undefined): string[] {
  if (orderBy === undefined) {
    return [];
  }
  if (!Array.isArray(orderBy)) {
    orderBy = [(orderBy as unknown) as string];
  }
  return orderBy.map((o) => o.toString().split('_')[0]);
}
