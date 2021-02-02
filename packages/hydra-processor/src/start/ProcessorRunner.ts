import { MappingsProcessor } from '../process/MappingsProcessor'
import { Connection } from 'typeorm'
import Debug from 'debug'
import { logError } from '@dzlzv/hydra-common'
import { log } from 'console'
import { createDBConnection } from '../db/dal'
import { ProcessorPromClient, startPromEndpoint } from '../prometheus'
import { getManifest } from './config'
import { info } from '../util/log'

const debug = Debug('index-builder:manager')

// Respondible for creating, starting up and shutting down the query node.
// Currently this class is a bit thin, but it will almost certainly grow
// as the integration logic between the library types and the application
// evolves, and that will pay abstraction overhead off in terms of testability of otherwise
// anonymous code in root file scope.
export class ProcessorRunner {
  private connection: Connection | undefined
  constructor() {
    // TODO: a bit hacky, but okay for now
    debug(
      `Hydra processor lib version: ${
        process.env.npm_package_dependencies__dzlzv_hydra_processor || 'UNKNOWN'
      }`
    )
    // Hook into application
    // eslint-disable-next-line
    process.on('exit', () => this.cleanUp().catch((e) => log(`${logError(e)}`)))
  }

  /**
   * Starts the mappings processor
   *
   * @param options options passed to create the mappings
   */
  async process(): Promise<void> {
    const manifest = getManifest()
    this.connection = await createDBConnection(manifest.entities)

    const processor = new MappingsProcessor()

    try {
      const promClient = new ProcessorPromClient()
      promClient.init()
      startPromEndpoint()
    } catch (e) {
      console.error(`Can't start Prometheus endpoint: ${logError(e)}`)
    }

    try {
      await processor.start()
    } finally {
      await this.cleanUp()
    }
  }

  async cleanUp(): Promise<void> {
    if (this.connection) {
      debug('Closing the database connection...')
      await this.connection.close()
      debug('Done')
    }
  }
}
