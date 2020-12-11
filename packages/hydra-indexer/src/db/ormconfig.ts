import { ConnectionOptions } from 'typeorm'
import { SnakeNamingStrategy } from '@dzlzv/hydra-db-utils'
import { SubstrateEventEntity, SubstrateExtrinsicEntity } from '../entities'
import { IndexerSchema } from '../migrations/IndexerSchema'
import { BlockTimestamp } from '../migrations/BlockTimestamp'

const config: () => ConnectionOptions = () => {
  return {
    type: 'postgres',
    host: process.env.TYPEORM_HOST || process.env.DB_HOST,
    port: parseInt(
      process.env.TYPEORM_PORT || process.env.DB_PORT || '5432',
      10
    ),
    username: process.env.TYPEORM_USERNAME || process.env.DB_USER,
    password: process.env.TYPEORM_PASSWORD || process.env.DB_PASS,
    database: process.env.TYPEORM_DATABASE || process.env.DB_NAME,
    entities: [SubstrateEventEntity, SubstrateExtrinsicEntity],
    migrations: [IndexerSchema, BlockTimestamp],
    cli: {
      migrationsDir: 'migrations',
    },
    logging: process.env.TYPEORM_LOGGING || 'error',
    namingStrategy: new SnakeNamingStrategy(),
  } as ConnectionOptions
}

export default config
