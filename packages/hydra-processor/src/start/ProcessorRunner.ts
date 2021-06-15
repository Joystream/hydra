import { MappingsProcessor } from '../process/MappingsProcessor'
import { Connection } from 'typeorm'
import Debug from 'debug'
import { logError } from '@joystream/hydra-common'
import { log } from 'console'
import { createDBConnection } from '../db/dal'
import { ProcessorPromClient, startPromEndpoint } from '../prometheus'
import { getManifest } from './config'
import { error, info } from '../util/log'
import pWaitFor from 'p-wait-for'
import { Server } from 'http'
import { getHydraVersion } from '../state/version'

const debug = Debug('hydra-processor:runner')

/**
 * This is a starter class, which sets up the DB connection,
 * instantiates the `MappingProcessor`, Promtheus Client and so on
 */
export class ProcessorRunner {
  private connection: Connection | undefined
  private processor: MappingsProcessor | undefined
  private promServer: Server | undefined

  constructor() {
    info(`Hydra processor lib version: ${getHydraVersion()}`)
    // Hook into application
    // eslint-disable-next-line
    process.on('exit', () =>
      this.shutDown().catch((e) => log(`${logError(e)}`))
    )
    process.on('SIGINT', () =>
      this.shutDown().catch((e) => log(`${logError(e)}`))
    )
  }

  /**
   * Starts the mappings processor
   *
   * @param options options passed to create the mappings
   */
  async process(): Promise<void> {
    const manifest = getManifest()
    info('Establishing a database connection')
    this.connection = await createDBConnection(manifest.entities)

    this.processor = new MappingsProcessor()

    try {
      const promClient = new ProcessorPromClient()
      promClient.init()
      this.promServer = startPromEndpoint()
    } catch (e) {
      error(`Can't start Prometheus endpoint: ${logError(e)}`)
    }

    await this.processor.start()
  }

  async shutDown(): Promise<void> {
    if (this.processor) {
      this.processor.stop()
      await pWaitFor(() => (this.processor as MappingsProcessor).stopped)
    }

    if (this.connection && this.connection.isConnected) {
      info('Closing the database connection...')
      await this.connection.close()
      debug('Done closing the connection')
    }

    if (this.promServer) {
      this.promServer.close()
    }
    debug(`Exiting`)
    // force all pending promises and open ports to exit
    process.exit()
  }
}
