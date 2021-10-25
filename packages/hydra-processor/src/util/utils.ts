export function parseEventId(eventId: string): {
  blockHeight: number
  eventId: number
  hash?: string
} {
  const parts = eventId.split('-')

  if (parts.length < 2) {
    throw new Error(
      `Event ID ${eventId} does not match the format <blockHeight>-<eventId>-<hash>`
    )
  }

  const hash = parts.length >= 3 ? parts[2] : undefined

  return {
    blockHeight: parseInt(parts[0], 10),
    eventId: parseInt(parts[1], 10),
    hash,
  }
}

/**
 * Takes each string in the array, puts into quotes and joins with a comma
 * [a,b,c] -> "a","b","c"
 *
 */
export function quotedJoin(toQuote: string[]): string {
  return toQuote.map((s) => `"${s}"`).join()
}

/**
 * Remove spaces and carriage returns from a string
 * @param s
 */
export function stripSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').replace('( ', '(').replace(' )', ')').trim()
}

export function format(s: string): string {
  return stripSpaces(s).replace('{ ', '{\n').replace(' }', '\n}\n')
}

export function compact(s: string): string {
  return s.replace(/\s/g, '')
}

export function stringify(obj: any): string {
  return JSON.stringify(
    obj,
    (k, v) => {
      if (typeof v === 'bigint') {
        return v.toString()
      } else {
        return v
      }
    },
    2
  )
}
