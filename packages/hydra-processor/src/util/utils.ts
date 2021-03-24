import Debug from 'debug'
import fs from 'fs'

const debug = Debug('hydra-processor:util')
export const PROCESSOR_PACKAGE_NAME = '@dzlzv/hydra-processor'

/**
 * resolve a package version by resolving package.json
 *
 * @param pkgName dependency to loockup
 */
export function resolvePackageVersion(pkgName: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require.resolve(`${PROCESSOR_PACKAGE_NAME}/package.json`)
  const pkgJson = JSON.parse(fs.readFileSync(path, 'utf-8')) as Record<
    string,
    unknown
  >
  debug(`Resolved package.json: ${JSON.stringify(pkgJson, null, 2)}`)

  if (pkgName === PROCESSOR_PACKAGE_NAME) {
    return pkgJson.version as string
  }

  if (pkgJson.dependencies) {
    const deps = pkgJson.dependencies as Record<string, string>
    if (deps[pkgName]) return deps[pkgName]
  }

  throw new Error(`Can't resolve ${pkgName} version`)
}

export function parseEventId(
  eventId: string
): { blockHeight: number; eventId: number } {
  const parts = eventId.split('-')

  if (parts.length !== 2) {
    throw new Error(
      `Event ID ${eventId} does not match the format <blockHeight>-<eventId>`
    )
  }

  return {
    blockHeight: parseInt(parts[0], 10),
    eventId: parseInt(parts[1], 10),
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
