import semver from 'semver'
import path from 'path'

export function validateIndexerVersion(
  indexerVersion: string,
  indexerVersionRange: string
): void {
  const ok = semver.satisfies(indexerVersion, indexerVersionRange, {
    loose: true,
    includePrerelease: true,
  })
  if (!ok)
    throw new Error(
      `Incompatible indexer. Indexer version is ${indexerVersion}, but ${indexerVersionRange} is required`
    )
}

export function getHydraVersion(): string {
  try {
    const pkg = require(path.join(__dirname, '../../package.json'))
    return pkg.version || 'unknown'
  } catch (e: any) {
    return 'unknown'
  }
}
