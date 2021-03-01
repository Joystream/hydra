import * as path from 'path'
import * as dotenv from 'dotenv'
import { Command, flags } from '@oclif/command'

import cli from 'cli-ux'
import Debug from 'debug'

import { createDir } from '../utils/utils'
import createGraphQLServer from '../codegen/graphql-server'

const debug = Debug('qnode-cli:codegen')

export default class Codegen extends Command {
  static description = 'Code generator'
  static generatedFolderName = 'generated'

  static flags = {
    schema: flags.string({
      char: 's',
      description: 'Schema path, can be file or directory',
      default: '../../schema.graphql',
    }),

    createDb: flags.boolean({
      char: 'd',
      description: 'Create the DB and install migrations',
      default: false,
    }),
    // pass --no-install to skip the `yarn install` steps
    install: flags.boolean({
      allowNo: true,
      description: 'Install dependencies',
      default: true,
    }),
  }

  async run(): Promise<void> {
    dotenv.config()

    const { flags } = this.parse(Codegen)
    flags.install =
      flags.install && process.env.HYDRA_NO_DEPS_INSTALL !== 'true'
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const generatedFolderPath = path.resolve(
      process.cwd(),
      Codegen.generatedFolderName
    )

    createDir(generatedFolderPath)

    // Change directory to generated
    process.chdir(generatedFolderPath)

    // Create warthog graphql server
    cli.action.start('Generating the GraphQL server')
    await createGraphQLServer(flags)
    cli.action.stop()
  }
}

export type CodegenFlags = Record<keyof typeof Codegen.flags, boolean | string>
