import * as path from 'path'
import WarthogWrapper from '../helpers/WarthogWrapper'
import { createDir } from '../utils/utils'
import { CodegenFlags } from './codegen'

export default async function createGraphQLServer(
  flags: CodegenFlags
): Promise<void> {
  const goBackDir = process.cwd()

  const warthogProjectName = 'graphql-server'
  const warthogProjectPath = path.resolve(goBackDir, warthogProjectName)

  createDir(warthogProjectPath)

  process.chdir(warthogProjectPath)

  const warthogWrapper = new WarthogWrapper(flags)
  await warthogWrapper.run()

  if (flags.dbschema) {
    await warthogWrapper.generateDB()
  }

  process.chdir(goBackDir)
}
