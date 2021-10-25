import _ from 'lodash'

/**
 * A range of intergers, in the interval [from, to], inclusive.
 */
export interface Range {
  from: number
  to: number
}

export const EMPTY_RANGE: Range = {
  from: Number.NEGATIVE_INFINITY,
  to: Number.NEGATIVE_INFINITY,
}

export function isEmpty(range: Range): boolean {
  if (range === EMPTY_RANGE || range.to === Number.NEGATIVE_INFINITY) {
    return true
  }
  const { to, from } = range
  return to < from
}

export function intersects(range1: Range, range2: Range): boolean {
  return !isEmpty(intersect(range1, range2))
}

export function intersect(range1: Range, range2: Range): Range {
  if (isEmpty(range1) || isEmpty(range2)) {
    return EMPTY_RANGE
  }

  const from = Math.max(range1.from, range2.from)
  const to = Math.min(range1.to, range2.to)

  return isEmpty({ from, to }) ? EMPTY_RANGE : { from, to }
}

export function union(range1: Range, range2: Range): Range[] {
  if (isEmpty(range1) && isEmpty(range2)) {
    return []
  }
  if (isEmpty(range1)) return [range2]
  if (isEmpty(range2)) return [range1]

  if (intersects(range1, range2)) {
    return [
      {
        from: Math.min(range1.from, range2.from),
        to: Math.max(range1.to, range2.to),
      },
    ]
  }

  // the ranges don't intersect, return an array of two
  return [range1, range2].sort((r1, r2) => r1.from - r2.from)
}

export function intersectWith(range1: Range, ranges: Range[]): Range[] {
  if (isEmpty(range1)) return []
  return ranges
    .filter((r) => intersects(range1, r))
    .map((r) => intersect(range1, r))
}

/**
 * Intersect a range with an array of ranges until none of them overlap
 *
 * Implementation note: this is a straighforward implementation with linear complexity
 *
 * @param range1
 * @param ranges
 * @returns
 */
export function unionWith(range1: Range, ranges: Range[]): Range[] {
  if (ranges.length === 0) {
    return [range1]
  }

  let intersectLeftIndex = -1
  let intersectRightIndex = -1

  let unionRange = range1

  ranges.forEach((r, i) => {
    if (intersects(r, unionRange)) {
      intersectLeftIndex = intersectLeftIndex < 0 ? i : intersectLeftIndex
      intersectRightIndex = i
      unionRange = union(unionRange, r)[0]
    }
  })

  if (intersectLeftIndex < 0) {
    return [range1, ...ranges].sort((r1, r2) => r1.from - r2.from)
  }

  if (intersectLeftIndex === 0) {
    return intersectRightIndex === ranges.length
      ? [unionRange]
      : [unionRange, ...ranges.slice(intersectRightIndex + 1)]
  }

  return intersectRightIndex === ranges.length
    ? [...ranges.slice(0, intersectLeftIndex), unionRange]
    : [
        ...ranges.slice(0, intersectLeftIndex),
        unionRange,
        ...ranges.slice(intersectRightIndex + 1),
      ]
}

/**
 * Take pairwise union of two range arrays until not of them overlap
 *
 * Implementation note: the running complexity is a product of the array length and may be slow
 * for very large arrays
 *
 * @param ranges1
 * @param ranges2
 * @returns
 */
export function unionAll(ranges1: Range[], ranges2: Range[]): Range[] {
  const both = [...ranges1, ...ranges2]
    .filter((r) => !isEmpty(r))
    .sort((r1, r2) => r1.from - r2.from)

  if (both.length === 0) {
    return []
  }

  return both
    .reduce((acc: Range[], r) => unionWith(r, acc), [both[0]])
    .sort((r1, r2) => r1.from - r2.from)
}

/**
 * checks if the given height is within a given range, [from, to] (inclusive)
 * By convention anything is withing the undefined range
 * @param height
 * @param range
 * @returns
 */
export function isInRange(height: number, range: Range | undefined): boolean {
  if (range === undefined) {
    return true
  }
  const { from, to } = range
  return from <= height && height <= to
}

export function stringifyRange({ from, to }: Range): string {
  return `[${from}, ${to}]`
}

export function numbersIn({ from, to }: Range): number[] {
  if (
    from === Number.NEGATIVE_INFINITY ||
    to === Number.POSITIVE_INFINITY ||
    from - to > 100_000_000
  ) {
    throw new Error(`The range [${from}, ${to}] is too large`)
  }
  return _.range(from, to + 1, 1)
}

/**
 * parses an interval. Square bracket mean inclusive, curly braces mean exclusive
 * @param range string of the form [<number>, <number>]
 * @throw throws if the range is empty or if theere's a parsing error
 */
export function parseRange(range: string | undefined): Range {
  const defaultEmpty = {
    from: 0,
    to: Number.POSITIVE_INFINITY,
  }
  if (range === undefined) {
    return defaultEmpty
  }

  const trimmed = range.trim().replace(/\s/g, '')
  if (!trimmed.match(/^[[(]-?\d*,-?\d*[)\]]$/)) {
    throw new Error(`Malformed range: ${range}`)
  }

  const split = trimmed.replace(/[[()\]]/g, '').split(',')
  let left = split[0].length === 0 ? 0 : Number.parseInt(split[0])
  let right =
    split[1].length === 0 ? Number.POSITIVE_INFINITY : Number.parseInt(split[1])

  if (split[0].length !== 0 && trimmed.includes('(')) {
    left++
  }

  if (Number.isFinite(right) && trimmed.includes(')')) {
    right--
  }

  if (left > right) {
    throw new Error(`The range ${range} is empty`)
  }

  return { from: left, to: right }
}
