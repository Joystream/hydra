import semver from 'semver'
import Debug from 'debug'
import fs from 'fs'

const debug = Debug('hydra-processor:util')

export const PROCESSOR_PACKAGE_NAME = '@subsquid/hydra-processor'

export function validateHydraVersion(hydraVersion: string): void {
  const oursHydraVersion = getHydraVersion()
  if (
    !semver.satisfies(oursHydraVersion, hydraVersion, {
      loose: true,
      includePrerelease: true,
    })
  ) {
    throw new Error(`The processor version ${oursHydraVersion} does \\
not satisfy the required manifest version ${hydraVersion}`)
  }
}

export function validateIndexerVersion(
  indexerVersion: string,
  indexerVersionRange: string
): void {
  if (
    !semver.satisfies(indexerVersion, indexerVersionRange, {
      loose: true,
      includePrerelease: true,
    })
  ) {
    throw new Error(`The indexer version range ${indexerVersionRange} does \\
not satisfy the manifest version ${indexerVersion}`)
  }
}

export function getHydraVersion(): string {
  return resolvePackageVersion(PROCESSOR_PACKAGE_NAME)
}

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
