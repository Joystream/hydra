import * as fs from 'fs-extra'
import * as path from 'path'
import Debug from 'debug'
import { FieldDefinitionNode } from 'graphql'

const debug = Debug('hydra-cli:utils')

export function createDir(path: string, del = false, recursive = false): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive })
  }
  if (del) {
    fs.removeSync(path)
    fs.mkdirSync(path)
  }
}

export function createFile(path: string, content = '', replace = false): void {
  if (!fs.existsSync(path) || replace) {
    fs.writeFileSync(path, content)
  }
}

export async function copyFiles(from: string, to: string): Promise<void> {
  try {
    await fs.copy(from, to)
  } catch (err) {
    console.error(err)
  }
}

export function getTemplatePath(template: string): string {
  const templatePath = path.resolve(
    __dirname,
    '..',
    'templates',
    ...template.split('/')
  )
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Tempate ${template} does not exists!`)
  }
  return templatePath
}

/**
 * Load package.json of the current hydra-cli version
 */
export function resolveHydraCliPkgJson(): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require.resolve('@joystream/hydra-cli/package.json')

  return JSON.parse(fs.readFileSync(path, 'utf-8')) as Record<string, unknown>
}

/**
 * Copies the template to the current directory of the process under the <filename>
 *
 * @param template Template file int templates/<templateName>
 * @param fileName Filename of the file to be created
 */
export async function copyTemplateToCWD(
  templateName: string,
  fileName: string
): Promise<void> {
  await fs.copyFile(
    getTemplatePath(templateName),
    path.join(process.cwd(), fileName)
  )
}

/**
 * resolve a package version by resolving package.json
 *
 * @param pkgName dependency to loockup
 */
export function resolvePackageVersion(pkgName: string): string {
  const pkgJson = resolveHydraCliPkgJson()

  debug(`Resolved hydra-cli package.json: ${JSON.stringify(pkgJson, null, 2)}`)

  // all hydra packages use the same version now
  if (pkgName.startsWith('@joystream/hydra')) {
    return pkgJson.version as string
  }

  if (pkgJson.hydraDependencies) {
    const deps = pkgJson.hydraDependencies as Record<string, string>
    if (deps[pkgName]) return deps[pkgName]
  }

  throw new Error(`Can't resolve ${pkgName} version`)
}

/**
 * Tries to resolve a filepath from node_modules and reads the file as a string
 *
 * @param path a path like 'someModule/<path-to-file>
 */
export function readModuleFile(path: string): string {
  const resolved = require.resolve(path)
  return fs.readFileSync(resolved, 'utf-8')
}

/**
 * Parse stderr for warthog command `warthog codegen` (child process).
 * @param stderr string
 */
export function parseWarthogCodegenStderr(stderr: string): void {
  // String to look if there is any graphql error
  const graphqlErrors = `GeneratingSchemaError: Generating schema error`
  // Pattern to search if any file under the generated/graphql-server/src/* has problems
  const sourceCodeErrors = /src\/modules\/\S*.ts/g
  const errorMsg = `Failed to generate Graphql API due to errors: \n`

  const m = stderr.match(sourceCodeErrors)
  if (m !== null) {
    throw Error(errorMsg + stderr.slice(stderr.indexOf(m[0])))
  } else if (stderr.includes(graphqlErrors)) {
    throw Error(errorMsg + stderr)
  }
}

export function getWarthogDependency(): string {
  /* eslint-disable */
  const warthogPackageJson = require('warthog/package.json') as Record<
    string,
    unknown
  >
  debug(`Warthog package json: ${JSON.stringify(warthogPackageJson, null, 2)}`)
  // if there is a special 'hydra' property, use it as depenency, otherwise use hardcoded fallback
  if (warthogPackageJson.hydra === undefined) {
    throw new Error(`Cannot resolve warthog version`)
  }
  return warthogPackageJson.hydra as string
}

export const verifySchemaExt = (file: string) =>
  path.extname(file) === '.graphql' || path.extname(file) === '.gql'
export const isFile = (file: string) => fs.lstatSync(file).isFile()

/**
 * Get available directive names from a FieldNode
 * @param fieldNode FieldNode
 * @returns string[]
 */
export function getDirectiveNames(fieldNode: FieldDefinitionNode): string[] {
  const { directives } = fieldNode
  if (!directives) return []
  return directives.map((d) => d.name.value)
}
