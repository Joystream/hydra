import { configure, getConfig, ListeningServer, prometheus } from '.'
import { createDBConnection } from '../db/dal'
import { Connection, getConnection } from 'typeorm'
import Debug from 'debug'
import { logError } from '@subsquid/hydra-common'
import { eventEmitter, IndexerEvents } from './event-emitter'
import { initPubSub } from '../redis/RedisRelayer'
import { IndexBuilder } from '../indexer'

const debug = Debug('hydra-indexer:manager')

let promServer: ListeningServer
/**
 * A wrapper class for running the archive and migrations
 */
export class ArchiveStarter {
  /**
   * Runs the archive
   *
   * @param options options passed to create the archive service
   */
  static async run(): Promise<void> {
    debug(`Hydra Indexer version: ${getHydraVersion()}`)

    configure()
    await createDBConnection()
    debug(`Database connection OK`)

    initPubSub()
    debug(`PubSub OK`)

    promServer = await prometheus.serve(getConfig().PROMETHEUS_PORT)
    console.log(`Prometheus metrics service listening on port ${getConfig().PROMETHEUS_PORT}`)

    // Start only the indexer
    const indexBuilder = new IndexBuilder()
    try {
      await indexBuilder.start()
    } catch (e) {
      debug(`Stopping the indexer due to errors: ${logError(e)}`)
      process.exitCode = -1
    } finally {
      await cleanUp()
    }
  }

  /**
   * Run migrations in the "migrations" folder;
   */
  static async migrate(): Promise<void> {
    let connection: Connection | undefined
    try {
      connection = await createDBConnection()
      if (connection) await connection.runMigrations()
    } finally {
      if (connection) await connection.close()
    }
  }
}

function getHydraVersion(): string {
  return process.env.npm_package_version || 'UNKNOWN'
}

export async function cleanUp(): Promise<void> {
  debug(`Cleaning up the indexer...`)
  try {
    eventEmitter.emit(IndexerEvents.INDEXER_STOP)
  } catch (e) {
    // ignore
  }

  try {
    const connection = getConnection()
    if (connection && connection.isConnected) {
      debug('Closing the database connection')
      await connection.close()
    }
  } catch (e) {
    debug(`Error cleaning up: ${logError(e)}`)
  }

  if (promServer) {
    debug('Shutting down the Prometheus server')
    await promServer.close()
  }

  debug(`Bye!`)
  process.exit()
}
