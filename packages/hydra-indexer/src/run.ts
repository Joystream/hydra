import * as dotenv from 'dotenv'
import * as chalk from 'chalk'
import * as figlet from 'figlet'
import * as commander from 'commander'
import * as path from 'path'

import { configure, getLogger } from 'log4js'

import { QueryNodeManager } from './index'

const logger = getLogger()

const withErrors = (command: (...args: any[]) => Promise<void>) => {
  return async (...args: any[]) => {
    try {
      await command(...args)
    } catch (e) {
      console.log(chalk.red(e.stack))
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
    .option('-h, --height', 'starting block height')
    .option('-t, --typedefs [typedefs]', 'type definitions')
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

  if (opts.height) {
    process.env.BLOCK_HEIGHT = opts.height
  } else if (!process.env.BLOCK_HEIGHT) {
    process.env.BLOCK_HEIGHT = '0'
  }

  // log4js config
  if (opts.logging) {
    configure(opts.logging)
  } else {
    // log4js default: DEBUG to console output;
    getLogger().level = 'debug'
  }
}

async function runIndexer(opts: Record<string, unknown>) {
  const node = new QueryNodeManager()
  const atBlock = process.env.BLOCK_HEIGHT

  const typesPath = path.join(
    process.cwd(),
    (process.env.TYPES_JSON || opts.typedefs || '') as string
  )
  const types = typesPath
    ? (require(typesPath) as Record<string, Record<string, string>>)
    : {}

  const wsProviderURI = (process.env.WS_PROVIDER_ENDPOINT_URI ||
    opts.provider) as string

  if (!wsProviderURI) {
    throw new Error(`Chain API endpoint is not provided`)
  }

  await node.index({
    wsProviderURI,
    atBlock: atBlock && atBlock !== '0' ? Number.parseInt(atBlock) : undefined,
    types,
  })
}

async function runMigrations() {
  logger.info(`Running migrations`)
  await QueryNodeManager.migrate()
  // TODO: here should be TypeORM migrations...
}

main()
