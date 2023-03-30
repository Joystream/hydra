import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { GeneratorConfig } from '.'
import { IConfig } from '../commands/typegen'
import { formatWithPrettier, writeFile } from '../util'

const debug = require('debug')('hydra-typegen:gen-typesLookup')

export async function generateTypesLookup(
  { outDir, typegenBinPath }: IConfig,
  { dest, specVersion }: GeneratorConfig
) {
  const TYPES_LOOKUP_FILE_NAME = 'types-lookup.ts'
  const TYPES_OUT_DIR_NAME = 'types'

  // create the temporary types-lookup directory
  const typesLookupOutDir = path.join(dest, TYPES_OUT_DIR_NAME)
  fs.mkdirSync(typesLookupOutDir, { recursive: true })

  // generate types-lookup.ts using polkadot typegen
  const pExecFile = promisify(execFile)

  const typegenInput = path.join(
    outDir,
    specVersion.toString(),
    TYPES_OUT_DIR_NAME
  )
  const typegenSource = path.join(
    outDir,
    specVersion.toString(),
    'metadata.json'
  )

  await pExecFile(path.join(process.cwd(), typegenBinPath), [
    '--endpoint',
    typegenSource,
    '--input',
    typegenInput,
    '--package',
    dest,
  ])

  // read types-lookup.ts
  const file = fs.readFileSync(
    path.join(typesLookupOutDir, TYPES_LOOKUP_FILE_NAME),
    'utf8'
  )

  // remove module augmentation from the file
  const outFile = file
    .replace(`declare module '@polkadot/types/lookup' {`, '')
    .replace('} // declare module', '')

  // save the file
  writeFile(path.join(dest, TYPES_LOOKUP_FILE_NAME), () =>
    formatWithPrettier(outFile)
  )

  // remove the temporary types-lookup directory
  fs.rmSync(typesLookupOutDir, { recursive: true, force: true })

  debug('Done writing types-lookup')
}
