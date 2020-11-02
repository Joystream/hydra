import { ConnectionOptions } from 'typeorm'
import { SnakeNamingStrategy } from '@dzlzv/hydra-db-utils'
import { ProcessedEventsLogEntity } from '../entities/ProcessedEventsLogEntity'

const config: () => ConnectionOptions = () => {
  return {
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT || '5432', 10),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [ProcessedEventsLogEntity, process.env.TYPEORM_ENTITIES],
    migrations: [],
    cli: {
      migrationsDir: 'migrations',
    },
    logging: process.env.TYPEORM_LOGGING === 'true',
    namingStrategy: new SnakeNamingStrategy(),
  } as ConnectionOptions
}

export default config
