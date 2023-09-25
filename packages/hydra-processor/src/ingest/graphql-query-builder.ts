import { compact } from 'lodash'
import { GraphQLQuery, QueryFields, ObjectFilter } from '.'
import { format, stripSpaces } from '../util/utils'

export type FilterValue<T> =
  | undefined
  | string
  | number
  | string[]
  | number[]
  | ObjectFilter<T[keyof T]>

export function isArray<T>(f: FilterValue<T>): f is string[] | number[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return f !== undefined && (f as any).pop !== undefined
}

export function isObject<T>(f: FilterValue<T>): f is ObjectFilter<T[keyof T]> {
  return f !== undefined && typeof f === 'object'
}

export function isString(f: string | number): f is string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (f as any).length !== undefined
}

export function formatScalar(value: string | number): string {
  return isString(value) ? `"${value}"` : `${value}`
}

export function formatClause<T>(name: string, value: FilterValue<T>): string {
  if (value === undefined) return ''
  return `${name}: ${formatFilterValue(value)}`
}

export function formatFilterValue<T>(value: FilterValue<T>): string {
  if (value === undefined) {
    return ''
  }
  if (isArray(value)) {
    return `[${(value as string[])
      .map((s: string | number) => `${formatScalar(s)}`)
      .join(', ')}]`
  }

  if (isObject(value)) {
    return stripSpaces(`{ ${collectFieldClauses(value)} }`)
  }

  return formatScalar(value as string | number)
}

export function singleFieldClauses<T>(
  field: string,
  filter: Record<string, FilterValue<T>> | undefined
): string[] {
  if (filter === undefined) {
    return ['']
  }

  return Object.keys(filter).reduce((acc, clause: string) => {
    if (filter[clause] === undefined) {
      return acc
    }

    acc.push(
      `${field}_${clause}: ${formatFilterValue(
        filter[clause] as FilterValue<T>
      )}`
    )
    return acc
  }, [] as string[])
}

export function collectFieldClauses<T>(where: ObjectFilter<T>): string {
  const whereBody: string[] = Object.keys(where).reduce((acc, f) => {
    acc.push(
      ...singleFieldClauses(
        f,
        // we simplify types here as QueryWhere is already type-checked
        where[f as keyof typeof where] as
          | Record<string, FilterValue<T>>
          | undefined
      )
    )

    return acc
  }, [] as string[])
  return `${compact(whereBody).join(', ')}`
}

export function buildWhere<T>(where: ObjectFilter<T>): string {
  // let whereBody: string[] = Object.keys(where).reduce((acc, f) => {
  //   acc.push(...clauses(f, where[f as keyof typeof where]))

  //   return acc
  // }, [] as string[])
  // whereBody = compact(whereBody)
  return stripSpaces(`where: { ${collectFieldClauses(where)} }`)
}

export function buildQueryFields<T>(fields: QueryFields<T>): string {
  let output = ''
  for (const field of fields) {
    if (typeof field === 'string') {
      // simple field
      output = `${output}${field}\n`
    } else {
      // only a single key
      const keys = Object.keys(field)
      if (keys.length > 1) {
        throw new Error(
          'Composite field must have a single key, split into multiple composit fields if necessary'
        )
      }
      const key = keys[0] as keyof T
      const nestedFields = (
        field as Partial<{ [P in keyof T]: QueryFields<T[P]> }>
      )[key] as QueryFields<T[typeof key]>

      output = `
      ${output}${String(key)} {
        ${buildQueryFields(nestedFields)}
      }\n`
    }
  }
  return format(output)
}

export function formatOrderBy(
  orderBy:
    | Partial<{
        asc: string
        desc: string
      }>
    | undefined
): string {
  if (orderBy === undefined) {
    return ''
  }
  const suffix = orderBy.asc ? 'ASC' : 'DESC'
  const field = orderBy.asc || orderBy.desc

  if (field === undefined) {
    throw new Error(
      `OrderBy should have at least one field: ${JSON.stringify(orderBy)}`
    )
  }

  return `orderBy: ${field}_${suffix}`
}

export function buildQuery<T>({
  name,
  query: { where, limit, orderBy },
  fields,
}: GraphQLQuery<T>): string {
  const parts: string[] = compact([
    buildWhere(where),
    formatClause('limit', limit),
    formatOrderBy(orderBy),
  ])

  return stripSpaces(`${name}( ${parts.join(', ')} ) {
    ${buildQueryFields(fields)}
  }`)
}

export function collectNamedQueries<T>(queries: {
  [K in keyof T]: GraphQLQuery<T[K]>
}): string {
  return `query {
    ${Object.keys(queries)
      .map((name) => {
        const query = queries[
          name as keyof typeof queries
        ] as GraphQLQuery<unknown>
        return `${name}: ${buildQuery(query)}`
      })
      .join('\n')}
  }`
}
