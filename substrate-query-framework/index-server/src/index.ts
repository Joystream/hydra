import 'reflect-metadata'
import { loadConfig } from '../src/config'
import { Logger } from '../src/logger'
import { getServer } from './server'
import Debug from 'debug'
import { shutdownServices, initServices } from './services'
const debug = Debug('index-server:index')

async function bootstrap() {
  debug('Bootstrapping the server')
  await loadConfig()
  const server = getServer()
  debug('Server created!')
  initServices()
  await server.start()
  debug('The server has started!')
}

bootstrap().catch((error: Error) => {
  debug('Exiting the process due to errors')
  Logger.error(error)
  if (error.stack) {
    Logger.error(error.stack.split('\n'))
  }

  Logger.info('Shutting down the server')
  shutdownServices()
  process.exit(1)
})
