import * as path from 'path'
import * as dotenv from 'dotenv'
import { Command, flags } from '@oclif/command'

import cli from 'cli-ux'
import Debug from 'debug'

import { createDir } from '../utils/utils'
import { createProcessor } from '../codegen/processor'
import createGraphQLServer from '../codegen/graphql-server'

const debug = Debug('qnode-cli:codegen')

export default class Codegen extends Command {
  static description = 'Code generator'
  static generatedFolderName = 'generated'

  static flags = {
    schema: flags.string({
      char: 's',
      description: 'Schema path',
      default: '../../schema.graphql',
    }),
    // pass --no-indexer to skip indexer generation
    processor: flags.boolean({
      char: 'i',
      allowNo: true,
      description: 'Generate Hydra Processor',
      default: true,
    }),
    // pass --no-graphql to skip graphql generation
    graphql: flags.boolean({
      char: 'g',
      allowNo: true,
      description: 'Generate GraphQL server',
      default: true,
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
    if (flags.graphql) {
      cli.action.start('Generating the GraphQL server')
      await createGraphQLServer(flags)
      cli.action.stop()
    }

    // Create Hydra processor
    if (flags.processor) {
      cli.action.start('Generating Hydra Processor')
      await createProcessor(flags)
      cli.action.stop()
    }
  }
}

export type CodegenFlags = Record<keyof typeof Codegen.flags, boolean | string>
