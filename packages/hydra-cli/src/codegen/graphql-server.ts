import * as path from 'path'
import WarthogWrapper from './WarthogWrapper'
import { createDir } from '../utils/utils'
import { CodegenFlags } from '../commands/codegen'

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

  process.chdir(goBackDir)
}
