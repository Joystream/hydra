import { Command, flags } from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'
import cli from 'cli-ux'
import Mustache from 'mustache'
import Debug from 'debug'

import {
  getTemplatePath,
  createDir,
  resolvePackageVersion,
  getWarthogDependency,
} from '../utils/utils'

import select = require('@inquirer/select')
import input = require('@inquirer/input')
import password = require('@inquirer/password')
import glob = require('glob')

const debug = Debug('qnode-cli:scaffold')

// TODO: fetch from a well-known source?
const INDEXERS = [
  {
    name: 'local',
    value: 'localhost',
    description: 'Self-hosted indexer at localhost:4001',
    url: 'http://localhost:4001/graphql',
  },
  {
    name: 'subsocial',
    value: 'subsocial',
    description: 'Ready-to use indexer of Subsocial, hosted by Joystream',
    url: 'https://subsocial-indexer.joystream.app/graphql',
  },
  {
    name: 'other',
    value: 'other',
    description:
      'Skip for now, I will manually set INDEXER_ENDPOINT_URL later on',
    url: '',
  },
]

export default class Scaffold extends Command {
  static description = `Starter kit: generates a directory layout and a sample schema file`

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'Project name',
      default: 'hydra-scaffold',
    }),

    indexerUrl: flags.string({
      char: 'i',
      description: 'Hydra Indexer endpoint',
      default: INDEXERS.find((e) => e.name === 'polkadot')?.url,
    }),
    dir: flags.string({
      char: 'd',
      description: 'Project folder',
      default: process.cwd(),
    }),
    rewrite: flags.boolean({
      description: 'Clear the folder before scaffolding',
    }),
    silent: flags.boolean({
      description:
        'If present, the scaffolder is non-interactive and uses only provided CLI flags',
    }),
    // pass --no-mappings to skip default mappings and schema
    mappings: flags.boolean({
      char: 'm',
      allowNo: true,
      description: 'Create schema and mappings',
      default: true,
    }),
    blockHeight: flags.string({
      char: 'b',
      description: 'Start block height',
      default: '0',
    }),
    dbHost: flags.string({
      char: 'h',
      description: 'Database host',
      default: 'localhost',
    }),
    dbPort: flags.string({
      char: 'p',
      description: 'Database port',
      default: '5432',
    }),
    dbUser: flags.string({
      char: 'u',
      description: 'Database user',
      default: 'postgres',
    }),
    dbPassword: flags.string({
      char: 'x',
      description: 'Database user password',
      default: 'postgres',
    }),
    appPort: flags.string({
      char: 'a',
      description: 'GraphQL server port',
      default: '4000',
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Scaffold)

    debug(`Flags: ${JSON.stringify(flags, null, 2)}`)

    let ctx = {}

    if (flags.silent) {
      ctx = { ...flags, dbName: flags.name }
    } else {
      ctx = await this.promptDotEnv()
    }

    ctx = withDependenciesResolutions(ctx)

    cli.action.start('Scaffolding')

    const destRoot = path.resolve(flags.dir)
    createDir(destRoot, flags.rewrite, true)

    debug(`Writing files to ${destRoot}`)

    const templatesRoot: string = path.resolve(
      __dirname,
      '..',
      'templates',
      'scaffold'
    )

    glob('**/*', { cwd: templatesRoot, dot: true }, (error, files) => {
      if (error) {
        throw new Error(`An error occured during scaffolding: ${error.message}`)
      }
      files.forEach((sourceFile) => {
        let destPath = path.join(destRoot, sourceFile)
        const sourcePath = path.join(templatesRoot, sourceFile)

        if (fs.lstatSync(sourcePath).isDirectory()) {
          createDir(destPath)
          return
        }

        debug(`Writing ${destPath}`)

        const source = fs.readFileSync(sourcePath, 'utf-8')

        if (sourcePath.endsWith('.mst')) {
          // if it's a template, use the context
          destPath = destPath.slice(0, -4)
          fs.writeFileSync(destPath, Mustache.render(source, ctx))
        } else {
          fs.writeFileSync(destPath, source)
        }
      })
    })

    cli.action.stop()
  }

  async dotenvFromFlags(flags: {
    [key: string]: string | boolean | undefined
  }): Promise<string> {
    const template = await fs.readFile(
      getTemplatePath('scaffold/.env'),
      'utf-8'
    )
    return Mustache.render(template, { ...flags, dbName: flags.projectName })
  }

  async promptDotEnv(): Promise<Record<string, string>> {
    let ctx: Record<string, string> = {}

    const projectName = (await input({
      message: 'Enter your project name',
    })) as string
    ctx = { ...ctx, projectName }

    ctx = { ...ctx, ...(await this.promptIndexerURL(ctx)) }

    const dbName = (await input({
      message: 'Database name',
      default: projectName,
    })) as string
    ctx = { ...ctx, dbName }

    const dbHost = (await input({
      message: 'Database host',
      default: 'localhost',
    })) as string
    ctx = { ...ctx, dbHost }

    const dbPort = (await input({
      message: 'Database port',
      default: '5432',
    })) as string
    ctx = { ...ctx, dbPort }

    const dbUser = (await input({
      message: 'Database user',
      default: 'postgres',
    })) as string
    ctx = { ...ctx, dbUser }

    const dbPassword = (await password({
      message: 'Database user password',
      type: 'mask',
      default: 'postgres',
    })) as string
    ctx = { ...ctx, dbPassword }

    return ctx
  }

  async promptIndexerURL(
    ctx: Record<string, string>
  ): Promise<Record<string, string>> {
    const answer = await select({
      message: 'Select a Hydra Indexer to be used by the mappings processor',
      choices: INDEXERS,
    })

    ctx = { ...ctx, indexerUrl: answer.url }
    return ctx
  }
}

export function withDependenciesResolutions(
  ctx: Record<string, string>
): Record<string, string> {
  return {
    ...ctx,
    hydraVersion:
      process.env.HYDRA_CLI_VERSION ||
      resolvePackageVersion('@dzlzv/hydra-cli'),
    hydraCommonVersion: resolvePackageVersion('@dzlzv/hydra-common'),
    hydraDbUtilsVersion: resolvePackageVersion('@dzlzv/hydra-db-utils'),
    hydraProcessorVersion: resolvePackageVersion('@dzlzv/hydra-processor'),
    hydraTypegenVersion: resolvePackageVersion('@dzlzv/hydra-typegen'),
    hydraWarthogVersion: getWarthogDependency(),
  }
}
