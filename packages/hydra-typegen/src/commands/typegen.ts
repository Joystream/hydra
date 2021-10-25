import { Command, flags } from '@oclif/command'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import path from 'path'
import { Config, CustomTypes, loadConfig, validateConfig } from '../config'
import { typegen } from '../gen'
import { getMetadata } from '../metadata'
import { OutDir } from '../out'
import { parseChainMetadata } from '../reflect'

interface Flags {
  outDir: string
  events?: string
  calls?: string
  metadata?: string
  blockHash?: string
  typedefs?: string
  typelib?: string
}

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
      description: `Comma-separated list of substrate events in the format <module>.<name>`,
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
    typedefs: flags.string({
      char: 't',
      description:
        'A relative path to a file with JSON definitions for custom types used by the chain',
    }),
    typelib: flags.string({
      char: 'i',
      description: `A JavaScript module from which the custom types should be imported, e.g. '@joystream/types/augment'`,
    }),
    outDir: flags.string({
      char: 'o',
      description:
        'A relative path the root folder where the generated files will be generated',
      default: 'src/types',
    }),
  }

  async run(): Promise<void> {
    dotenv.config()
    const { flags, args } = this.parse(Typegen)
    const config = args.config
      ? loadConfig(args.config)
      : this.parseFlags(flags)

    if (config.metadata?.source == null) {
      config.metadata = config.metadata || {}
      config.metadata.source = process.env.CHAIN_NODE
      if (config.metadata.source == null) {
        throw new Error(
          'Metadata source must me defined either via typegen config or CHAIN_NODE environment variable'
        )
      }
    }

    const typesJson =
      config.customTypes &&
      JSON.parse(fs.readFileSync(config.customTypes.typedefsLoc, 'utf-8'))

    const metadata = await getMetadata({
      source: config.metadata.source,
      blockHash: config.metadata.blockHash,
      typesJson,
    })
    const modules = parseChainMetadata(metadata)
    const outDir = new OutDir(config.outDir)

    outDir.del()

    typegen({
      modules,
      outDir,
      events: config.events,
      calls: config.calls,
      customTypes: config.customTypes && {
        json: typesJson,
        lib: config.customTypes.lib,
      },
    })
  }

  private parseFlags(flags: Flags): Config {
    let customTypes: CustomTypes | undefined
    if (flags.typedefs) {
      if (flags.typelib === undefined) {
        throw new Error(
          `Please specify the library with type definitions with --typelib`
        )
      }
      customTypes = {
        lib: flags.typelib,
        typedefsLoc: path.resolve(flags.typedefs),
      }
    }

    const events = flags.events?.split(',').map((e) => e.trim())
    const calls = flags.calls?.split(',').map((c) => c.trim())

    const config: Config = {
      events,
      calls,
      outDir: flags.outDir,
      metadata: {
        source: flags.metadata,
        blockHash: flags.blockHash,
      },
      customTypes,
    }

    validateConfig(config)
    return config
  }
}
