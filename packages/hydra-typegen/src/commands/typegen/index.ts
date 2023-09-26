import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import fs from 'fs'
import path from 'path'

import { parseConfigFile } from '../../config/parse-yaml'
import { validate } from '../../config/validate'
import {
  buildImportsRegistry,
  generateIndex,
  generateModuleTypes,
  generateRootIndex,
  generateTypeRegistry,
  generateTypesLookup,
  GeneratorConfig,
} from '../../generators'
import { extractMeta } from '../../metadata'
import { getAllMetadata, MetadataSource } from '../../metadata/metadata'

export interface IConfig {
  metadata: MetadataSource
  events: string[]
  calls: string[]
  outDir: string
  typegenBinPath: string
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
  typegenBinPath?: string
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
    typegenBinPath: flags.string({
      char: 't',
      description:
        'A relative path to the polkadot typegen binary (polkadot-types-from-defs)',
      default: 'node_modules/.bin/polkadot-types-from-defs',
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

  async buildGeneratorConfigs(config: IConfig): Promise<{
    configs: GeneratorConfig[]
    allMissingEvents: string[][]
    allMissingCalls: string[][]
  }> {
    const { outDir } = config

    const specsMetadata = await getAllMetadata(config.metadata)

    const results = await Promise.all(
      specsMetadata.map(async ([originalMetadata, chainSpec]) => {
        const { extracted, missingEvents, missingCalls } = await extractMeta(
          config,
          originalMetadata
        )

        return {
          config: {
            importsRegistry: buildImportsRegistry(),
            modules: extracted,
            validateArgs: config.strict || false,
            dest: path.resolve(
              path.join(outDir, chainSpec.specVersion.toString())
            ),
            originalMetadata,
            specVersion: chainSpec.specVersion,
          },
          missingEvents,
          missingCalls,
        }
      })
    )

    const generatorConfigs = results.map((r) => r.config)
    const allMissingEvents = results.map((r) => r.missingEvents)
    const allMissingCalls = results.map((r) => r.missingCalls)

    return { configs: generatorConfigs, allMissingEvents, allMissingCalls }
  }

  async generate(config: IConfig): Promise<void> {
    const { configs, allMissingEvents, allMissingCalls } =
      await this.buildGeneratorConfigs(config)

    const globalMissingEvents = config.events.filter(
      (event) =>
        !allMissingEvents.some(
          (missingEvents) => !missingEvents.includes(event)
        )
    )

    const globalMissingCalls = config.calls.filter(
      (call) =>
        !allMissingCalls.some((missingCalls) => !missingCalls.includes(call))
    )

    if (globalMissingEvents.length > 0) {
      throw new Error(
        `No metadata found for the events: ${globalMissingEvents.join(', ')}`
      )
    }
    if (globalMissingCalls.length > 0) {
      throw new Error(
        `No metadata found for the calls: ${globalMissingCalls.join(', ')}`
      )
    }

    for (const generatorConfig of configs) {
      const { dest } = generatorConfig

      debug(`Output dir: ${dest}`)
      fs.mkdirSync(dest, { recursive: true })

      generateIndex(generatorConfig)
      generateTypeRegistry(generatorConfig)
      await generateTypesLookup(config, generatorConfig)
      generateModuleTypes(generatorConfig)
    }

    generateRootIndex(config, configs)
  }
}
