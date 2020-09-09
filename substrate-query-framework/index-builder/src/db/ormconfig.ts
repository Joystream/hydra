import { ConnectionOptions } from 'typeorm';
import  { SnakeNamingStrategy } from './SnakeNamingStrategy';
import { SubstrateEventEntity, SubstrateExtrinsicEntity, ProcessedEventsLogEntity } from '../entities';
import { SavedEntityEvent } from '.';
import { CreateSchema } from '../migrations/CreateSchema';

const config: () => ConnectionOptions = () => {
  return {
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT || '5432', 10),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [ SubstrateEventEntity, SubstrateExtrinsicEntity, SavedEntityEvent, ProcessedEventsLogEntity, process.env.TYPEORM_ENTITIES ],
    migrations: [ CreateSchema ],
    cli: {
        migrationsDir: "migrations"
    },
    logging: (process.env.TYPEORM_LOGGING === 'true'),
    namingStrategy: new SnakeNamingStrategy()
  } as ConnectionOptions;
}

export default config;
