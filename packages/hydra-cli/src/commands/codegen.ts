import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { SourcesGenerator } from '../generate/SourcesGenerator'
import { WarthogModelBuilder } from '../parse/WarthogModelBuilder'
import { warthogexec } from '../utils/warthog-exec'

const debug = Debug('qnode-cli:codegen')

export default class Codegen extends Command {
  static description = 'Code generator'

  static flags = {
    schema: flags.string({
      char: 's',
      description: 'Schema path, can be file or directory',
      default: './schema.graphql',
    }),
  }

  async run(): Promise<void> {
    dotenv.config()

    const { flags } = this.parse(Codegen)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)

    // Create warthog graphql server
    const schemaFile = path.resolve(flags.schema)
    if (!fs.existsSync(schemaFile)) {
      console.error(
        `Cannot open the schema file or folder: ${schemaFile}. Check if it exists.`
      )
      process.exit(1)
    }

    const modelBuilder = new WarthogModelBuilder(schemaFile)
    const model = modelBuilder.buildWarthogModel()

    const sourcesGenerator = new SourcesGenerator('.', model)
    sourcesGenerator.generate()

    const ok = await warthogexec(['codegen'])
    process.exit(ok ? 0 : 1)
  }
}
