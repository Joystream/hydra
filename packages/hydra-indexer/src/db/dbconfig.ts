import { ConnectionOptions } from 'typeorm'
import { SnakeNamingStrategy } from '@dzlzv/hydra-db-utils'
import { SubstrateEventEntity, SubstrateExtrinsicEntity } from '../entities'
import { getDBConfig } from '../node'
import { SubstrateBlockEntity } from '../entities/SubstrateBlockEntity'

const config: () => ConnectionOptions = () => {
  const conf = getDBConfig()
  return {
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
    migrations: ['./**/migrations/*.js'],
    cli: {
      migrationsDir: 'src/migrations',
    },
    logging: conf.DB_LOGGING,
    namingStrategy: new SnakeNamingStrategy(),
  } as ConnectionOptions
}

export default config
