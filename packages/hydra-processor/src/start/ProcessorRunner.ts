import { MappingsProcessor } from '../process/MappingsProcessor'
import { ProcessorOptions } from './ProcessorOptions'
import { Connection, getConnection } from 'typeorm'
import Debug from 'debug'
import { logError } from '@dzlzv/hydra-common'
import { log } from 'console'
import { createDBConnection } from '../db/dal'

const debug = Debug('index-builder:manager')

// Respondible for creating, starting up and shutting down the query node.
// Currently this class is a bit thin, but it will almost certainly grow
// as the integration logic between the library types and the application
// evolves, and that will pay abstraction overhead off in terms of testability of otherwise
// anonymous code in root file scope.
export class ProcessorRunner {
  constructor() {
    // TODO: a bit hacky, but okay for now
    debug(
      `Hydra processor lib version: ${
        process.env.npm_package_dependencies__dzlzv_hydra_processor || 'UNKNOWN'
      }`
    )
    // Hook into application
    // eslint-disable-next-line
    process.on('exit', () =>
      ProcessorRunner.cleanUp().catch((e) => log(`${logError(e)}`))
    )
  }

  /**
   * Starts the mappings processor
   *
   * @param options options passed to create the mappings
   */
  async process(options: ProcessorOptions): Promise<void> {
    const extraEntities = options.entities ? options.entities : []
    await createDBConnection(extraEntities)

    const processor = new MappingsProcessor(options)
    await processor.start()
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

  static async cleanUp(): Promise<void> {}
}
