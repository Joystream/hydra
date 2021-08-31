import path from 'path'
import { ConnectionOptions } from 'typeorm'
import { SnakeNamingStrategy } from '@subsquid/hydra-db-utils'
import { SubstrateEventEntity, SubstrateExtrinsicEntity } from '../entities'
import { getDBConfig } from '../node'
import { SubstrateBlockEntity } from '../entities/SubstrateBlockEntity'

const migrationsDir = path.resolve(__dirname, '../migrations')

const config: (name?: string) => ConnectionOptions = (name) => {
  const conf = getDBConfig()
  return {
    name,
    type: 'postgres',
    host: conf.DB_HOST,
    port: conf.DB_PORT,
    username: conf.DB_USER,
    password: conf.DB_PASS,
    database: conf.DB_NAME,
    entities: [
      SubstrateEventEntity,
      SubstrateExtrinsicEntity,
      SubstrateBlockEntity,
    ],
    migrations: [`${migrationsDir}/v3/*.js`, `${migrationsDir}/v4/*.js`],
    cli: {
      migrationsDir: 'src/migrations/v3',
    },
    logging: conf.DB_LOGGING,
    namingStrategy: new SnakeNamingStrategy(),
  } as ConnectionOptions
}

export default config
