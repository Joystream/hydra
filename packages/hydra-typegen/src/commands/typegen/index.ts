import { Command, flags } from '@oclif/command'
import fs from 'fs'
import path from 'path'
import Debug from 'debug'

import { getMetadata, registerCustomTypes } from '../../metadata/metadata'
import { extractMeta, ExtractedMetadata, TypeDefs } from '../../metadata'
import {
  generateEventTypes,
  GeneratorConfig,
  buildImportsRegistry,
  generateIndex,
} from '../../generators'

export type CustomTypes = {
  defs: TypeDefs
  lib: string // package with types. All custom types will be imported from there
  typedefsLoc?: string // path to type definitions
}

export interface IConfig {
  metadata: ExtractedMetadata
  events: string[]
  customTypes?: CustomTypes
  dest: string
  strict: boolean
}

const debug = Debug('hydra-typegen:typegen')

export default class Typegen extends Command {
  static description = `Generate Typescript classes for the Substrate events`

  static usage = 'typegen Balances.transfer,Treasury.depositCreated'

  static args = [
    {
      name: 'events',
      description: 'Comma-separated list of events',
      required: true,
    },
  ]

  static flags = {
    metadata: flags.string({
      char: 'm',
      description: 'Chain metadata file',
      default: 'metadata.json',
    }),
    blockHash: flags.string({
      char: 'h',
      description:
        'Hash of the block from where the metadata should be fetched',
    }),
    typedefs: flags.string({
      char: 't',
      description: 'JSON definitions for custom types used by the chain',
    }),
    typelib: flags.string({
      char: 'i',
      description:
        'Destination from where the custom types should be imported, if provided',
    }),
    outDir: flags.string({
      char: 'o',
      description: 'Root folder to output generated files',
      default: 'generated/types',
    }),
    strict: flags.boolean({
      char: 's',
      description:
        'If the generated code should pre-validate event argument types',
      default: true,
    }),
    verbose: flags.boolean({ char: 'v' }),
  }

  async run(): Promise<void> {
    const { flags, args } = this.parse(Typegen)

    // TODO: we can in fact replace metadata and typedefs
    // for popular chains with just chain spec
    let customTypes
    if (flags.typedefs) {
      if (flags.typelib === undefined) {
        throw new Error(
          `Please specify the library with type definitions with --typelib`
        )
      }
      customTypes = {
        defs: registerCustomTypes(flags.typedefs),
        lib: flags.typelib,
        typedefsLoc: path.join(process.cwd(), flags.typedefs),
      }
    }

    const config: IConfig = {
      events: args.events.split(',').map((e: string) => e.trim()),
      dest: path.join(process.cwd(), flags.outDir),
      metadata: await getMetadata({
        source: flags.metadata,
        blockHash: flags.blockHash,
      }),
      strict: flags.strict,
      customTypes,
    }

    this.generate(config)
  }

  generate(config: IConfig) {
    const { dest, customTypes } = config

    debug(`Output dir: ${dest}`)
    fs.mkdirSync(dest, { recursive: true })

    let generatorConfig: GeneratorConfig = {
      customTypes,
      importsRegistry: buildImportsRegistry(customTypes),
      modules: extractMeta(config),
      validateArgs: config.strict,
      dest,
    }

    generateEventTypes(generatorConfig)
    generateIndex(generatorConfig)
  }
}
