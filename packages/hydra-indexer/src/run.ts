import dotenv from 'dotenv'
import chalk from 'chalk'
import figlet from 'figlet'
import commander from 'commander'

import { getLogger } from 'log4js'

import { configure, QueryNodeManager } from './index'

const logger = getLogger()

const withErrors = (command: (...args: any[]) => Promise<void>) => {
  return async (...args: any[]) => {
    try {
      await command(...args)
    } catch (e) {
      console.log(chalk.red((e as Error).stack))
      process.exit(1)
    }
  }
}

const withEnvs = (command: (opts: Record<string, string>) => Promise<void>) => {
  return async (opts: Record<string, string>) => {
    setUp(opts)
    await command(opts)
  }
}

function main(): commander.Command {
  console.log(chalk.green(figlet.textSync('Hydra-Indexer')))
  const program = new commander.Command()
  const version = process.env.npm_package_version || 'UNKNOWN'

  program.version(version).description('Hydra Indexer')

  program
    .command('index')
    .option('-h, --height <height>', 'starting block height')
    .option('-t, --typedefs [typedefs]', 'type definitions')
    .option('--spectypes [spectypes]', 'spec type definitions')
    .option('--chaintypes [chaintypes]', 'chain type definitions')
    .option('--bundletypes [bundletypes]', 'bundle type definitions')
    .option('--provider [chain]', 'substrate chain provider url')
    .option('-e, --env <file>', '.env file location', '.env')
    .description('Index all events and extrinsics in the substrate chain')
    .action(withErrors(withEnvs(runIndexer)))

  program
    .command('migrate')
    .description('Create the indexer schema')
    .option('-e, --env <file>', '.env file location', '../../.env')
    .action(withErrors(withEnvs(runMigrations)))

  program.parse(process.argv)

  return program
}

function setUp(opts: Record<string, string>) {
  // dotenv config
  dotenv.config()
  dotenv.config({ path: opts.env })

  // here we just translate the flags into env variables, defaults will be
  // set later
  process.env.BLOCK_HEIGHT = opts.height ?? process.env.BLOCK_HEIGHT ?? 0
  // process.env.LOG_CONFIG = opts.logging || process.env.LOG_CONFIG
  process.env.TYPES_JSON = opts.typedefs || process.env.TYPES_JSON
  process.env.SPEC_TYPES = opts.spectypes || process.env.SPEC_TYPES
  process.env.CHAIN_TYPES = opts.chaintypes || process.env.CHAIN_TYPES
  process.env.BUNDLE_TYPES = opts.bundletypes || process.env.BUNDLE_TYPES

  process.env.WS_PROVIDER_ENDPOINT_URI =
    opts.provider || process.env.WS_PROVIDER_ENDPOINT_URI
  // log4js config
  // if (opts.logging) {
  //   configure(opts.logging)
  // } else {
  //   // log4js default: DEBUG to console output;
  //   getLogger().level = 'debug'
  // }
}

async function runIndexer() {
  configure()
  const node = new QueryNodeManager()
  await node.index()
}

async function runMigrations() {
  logger.info(`Running migrations`)
  await QueryNodeManager.migrate()
  // TODO: here should be TypeORM migrations...
}

main()
