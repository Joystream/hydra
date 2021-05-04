import { compact } from 'lodash'
import { GraphQLQuery, QueryFields, QueryWhere } from '.'
import { format, stripSpaces } from '../util/utils'

export type FilterValue = undefined | string | number | string[] | number[]

export function isArray(f: FilterValue): f is string[] | number[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return f !== undefined && (f as any).pop !== undefined
}

export function isString(f: string | number): f is string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (f as any).length !== undefined
}

export function formatScalar(value: string | number): string {
  return isString(value) ? `"${value}"` : `${value}`
}

export function formatClause(name: string, value: FilterValue): string {
  if (value === undefined) return ''
  return `${name}: ${formatValue(value)}`
}

export function formatValue(value: FilterValue): string {
  if (value === undefined) {
    return ''
  }
  if (isArray(value)) {
    return `[${(value as string[])
      .map((s: string | number) => `${formatScalar(s)}`)
      .join(', ')}]`
  }

  return formatScalar(value as string | number)
}

export function clauses(
  field: string,
  filter: Record<string, FilterValue> | undefined
): string[] {
  if (filter === undefined) {
    return ['']
  }

  return Object.keys(filter).reduce((acc, clause: string) => {
    if (filter[clause] === undefined) {
      return acc
    }

    acc.push(
      `${field}_${clause}: ${formatValue(filter[clause] as FilterValue)}`
    )
    return acc
  }, [] as string[])
}

export function buildWhere<T>(where: QueryWhere<T>): string {
  let whereBody: string[] = Object.keys(where).reduce((acc, f) => {
    acc.push(...clauses(f, where[f as keyof typeof where]))

    return acc
  }, [] as string[])
  whereBody = compact(whereBody)
  return stripSpaces(`where: { ${whereBody.join(', ')} }`)
}

export function buildFields<T>(fields: QueryFields<T>): string {
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
      const nestedFields = (field as Partial<
        { [P in keyof T]: QueryFields<T[P]> }
      >)[key] as QueryFields<T[typeof key]>

      output = `
      ${output}${key} {
        ${buildFields(nestedFields)}
      }\n`
    }
  }
  return format(output)
}

export function buildQuery<T>({
  name,
  query: { where, limit, orderBy },
  fields,
}: GraphQLQuery<T>): string {
  const parts: string[] = compact([
    buildWhere(where),
    formatClause('limit', limit),
    ...clauses('orderBy', orderBy as Record<string, FilterValue> | undefined),
  ])

  return stripSpaces(`${name}( ${parts.join(', ')} ) {
    ${buildFields(fields)}
  }`)
}

export function collectNamedQueries<T>(
  queries: {
    [K in keyof T]: GraphQLQuery<T[K]>
  }
): string {
  return `query {
    ${Object.keys(queries)
      .map((name) => {
        const query = queries[name as keyof typeof queries] as GraphQLQuery<
          unknown
        >
        return `${name}: ${buildQuery(query)}`
      })
      .join('\n')}
  }`
}
