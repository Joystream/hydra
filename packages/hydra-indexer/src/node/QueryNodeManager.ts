import { QueryNode } from '.'
import { createDBConnection } from '../db/dal'
import { Connection, getConnection } from 'typeorm'
import Debug from 'debug'
import Container from 'typedi'
import { logError } from '@dzlzv/hydra-common'
import { log } from 'console'
import { RedisClientFactory } from '@dzlzv/hydra-db-utils'
import { eventEmitter, Events } from './event-emitter'

const debug = Debug('index-builder:manager')

// Respondible for creating, starting up and shutting down the query node.
// Currently this class is a bit thin, but it will almost certainly grow
// as the integration logic between the library types and the application
// evolves, and that will pay abstraction overhead off in terms of testability of otherwise
// anonymous code in root file scope.
export class QueryNodeManager {
  private _queryNode!: QueryNode

  constructor() {
    // TODO: a bit hacky, but okay for now
    debug(
      `Hydra indexer lib version: ${
        process.env.npm_package_dependencies__dzlzv_hydra_indexer_lib ||
        'UNKNOWN'
      }`
    )
    // Hook into application
    // eslint-disable-next-line
    process.on('SIGINT', () =>
      QueryNodeManager.cleanUp().catch((e) => log(`${logError(e)}`))
    )
    // // eslint-disable-next-line
    // process.on('exit', () =>
    //   QueryNodeManager.cleanUp().catch((e) => log(`${logError(e)}`))
    // )
  }

  /**
   * Starts the indexer
   *
   * @param options options passed to create the indexer service
   */
  async index(): Promise<void> {
    if (this._queryNode)
      throw Error('Cannot start the same manager multiple times.')
    await createDBConnection()

    this._queryNode = await QueryNode.create()
    try {
      await this._queryNode.start()
    } finally {
      debug('Trying to stop the query node')
      await QueryNodeManager.cleanUp()
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

  static async cleanUp(): Promise<void> {
    eventEmitter.emit(Events.NODE_STOP)
    if (Container.has('QueryNode')) {
      await Container.get<QueryNode>('QueryNode').stop()
    }

    if (Container.has('RedisClientFactory')) {
      Container.get<RedisClientFactory>('RedisClientFactory').stop()
    }
    try {
      const connection = getConnection()
      if (connection && connection.isConnected) {
        debug('Closing the database connection')
        await connection.close()
      }
    } catch (e) {
      debug(`Error: ${logError(e)}`)
    }
    process.exit()
  }
}
