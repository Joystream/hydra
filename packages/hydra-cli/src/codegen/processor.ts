import execa from 'execa'
import Listr from 'listr'
import * as path from 'path'
import { upperFirst, kebabCase } from 'lodash'
import Mustache from 'mustache'
import { formatWithPrettier } from '../helpers/formatter'
import {
  createDir,
  createFile,
  readModuleFile,
  resolvePackageVersion,
} from '../utils/utils'
import { CodegenFlags } from '../commands/codegen'
import { getTypeormConfig } from './torm-config'

export async function createProcessor({
  install,
}: CodegenFlags): Promise<void> {
  // Take process where back at the end of the function execution
  const goBackDir = process.cwd()

  // Block indexer folder path
  const indexerPath = path.resolve(goBackDir, 'hydra-processor')

  createDir(indexerPath)
  process.chdir(indexerPath)

  const generateFiles = {
    title: 'Generate source files',
    task: async () => {
      let indexFileContent = readModuleFile(
        '@dzlzv/hydra-processor/templates/run.ts.mst'
      )

      indexFileContent = Mustache.render(indexFileContent, {
        projectName: upperFirst(process.env.PROJECT_NAME),
      })
      createFile(path.resolve('index.ts'), formatWithPrettier(indexFileContent))

      let pkgJsonContent = readModuleFile(
        '@dzlzv/hydra-processor/templates/package.json'
      )

      pkgJsonContent = Mustache.render(pkgJsonContent, {
        hydraCommon: resolvePackageVersion('@dzlzv/hydra-common'),
        hydraDbUtils: resolvePackageVersion('@dzlzv/hydra-db-utils'),
        hydraProcessor: resolvePackageVersion('@dzlzv/hydra-processor'),
        pkgName: kebabCase(process.env.PROJECT_NAME),
        projectName: upperFirst(process.env.PROJECT_NAME),
      })
      createFile(
        path.resolve('package.json'),
        formatWithPrettier(pkgJsonContent, { parser: 'json' })
      )

      // Create .env file for typeorm database connection
      createFile(path.resolve('.env'), getTypeormConfig())

      // Create
      createFile(
        path.resolve('tsconfig.json'),
        readModuleFile('@dzlzv/hydra-processor/templates/tsconfig.json')
      )
    },
  }
  // Create index.ts file

  const installDeps = {
    title: 'Install dependencies for Hydra Processor',
    skip: () => {
      if (install !== true) {
        return 'Skipping: either --no-install flag has been passed or the HYDRA_NO_DEPS_INSTALL environment variable is set to'
      }
    },
    task: async () => {
      await execa('yarn', ['install'])
    },
  }

  const listr = new Listr([generateFiles, installDeps])
  await listr.run()

  process.chdir(goBackDir)
}
