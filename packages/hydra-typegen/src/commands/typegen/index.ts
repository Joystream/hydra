import { Command, flags } from '@oclif/command'
import fs from 'fs'
import path from 'path'
import Debug from 'debug'

import {
  getChainSpec,
  getMetadata,
  MetadataSource,
} from '../../metadata/metadata'
import { extractMeta } from '../../metadata'
import {
  generateModuleTypes,
  GeneratorConfig,
  buildImportsRegistry,
  generateIndex,
} from '../../generators'
import { parseConfigFile } from '../../config/parse-yaml'
import { validate } from '../../config/validate'
import { generateTypeRegistry } from '../../generators/gen-typeRegistry'

export interface IConfig {
  metadata: MetadataSource
  events: string[]
  calls: string[]
  outDir: string
  strict?: boolean
}

export type Flags = {
  events: string | undefined
  calls: string | undefined
  metadata: string
  blockHash: string | undefined
  outDir: string
  strict: boolean
  debug: boolean
}

const debug = Debug('hydra-typegen:typegen')

export default class Typegen extends Command {
  static description = `Generate Typescript classes for the Substrate events`

  static args = [
    {
      name: 'config',
      optional: true,
      description: `Path to YML config file. Overrides the flag options`,
    },
  ]

  static flags = {
    events: flags.string({
      char: 'e',
      description: `Comma-separated list of substrate events in the formation <module>.<name>`,
    }),
    calls: flags.string({
      char: 'c',
      description: `Comma-separated list of substrate calls in the format <module>.<name>`,
    }),
    metadata: flags.string({
      char: 'm',
      description: `Chain metadata source. \
If starts with ws:// or wss:// the metadata is pulled by an RPC call to the provided endpoint. \
Otherwise a relative path to a json file matching the RPC call response is expected`,
      default: 'metadata.json',
    }),
    blockHash: flags.string({
      char: 'h',
      description:
        'Hash of the block from which the metadata will be fetched. Only applied if metadata is pulled via an RPC call',
    }),
    outDir: flags.string({
      char: 'o',
      description:
        'A relative path the root folder where the generated files will be generated',
      default: 'generated/types',
    }),
    strict: flags.boolean({
      char: 's',
      description: `Strict mode. If on, the generated code throws an error if the input event argument \
types don't much the metadata definiton`,
      allowNo: true,
      default: false,
    }),
    debug: flags.boolean({
      description: `Output debug info`,
      char: 'd',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags, args } = this.parse(Typegen)

    if (flags.debug) {
      Debug.enable('hydra-typegen:*')
    }

    let config: IConfig | undefined

    if (args.config) {
      config = parseConfigFile(path.resolve(args.config))
    } else {
      config = this.parseFlags(flags)
    }

    validate(config)

    await this.generate(config)
  }

  parseFlags(flags: Flags): IConfig {
    const events: string[] = flags.events
      ? flags.events.split(',').map((e) => e.trim())
      : []
    const calls: string[] = flags.calls
      ? flags.calls.split(',').map((c) => c.trim())
      : []

    return {
      events,
      calls,
      outDir: flags.outDir,
      metadata: {
        source: flags.metadata,
        blockHash: flags.blockHash,
      },
      strict: flags.strict,
    } as IConfig
  }

  async buildGeneratorConfig(config: IConfig): Promise<GeneratorConfig> {
    const { outDir } = config

    const originalMetadata = await getMetadata(config.metadata)
    const modules = await extractMeta(config, originalMetadata)

    const { specVersion } = await getChainSpec(config.metadata.source)
    return {
      importsRegistry: buildImportsRegistry(),
      modules,
      validateArgs: config.strict || false, // do not enforce validation by default
      dest: path.resolve(path.join(outDir, specVersion.toString())),
      originalMetadata,
      specVersion,
    }
  }

  async generate(config: IConfig): Promise<void> {
    const generatorConfig = await this.buildGeneratorConfig(config)
    const { dest } = generatorConfig

    debug(`Output dir: ${dest}`)
    fs.mkdirSync(dest, { recursive: true })

    generateModuleTypes(generatorConfig)
    generateIndex(generatorConfig)
    generateTypeRegistry(generatorConfig)
  }
}
