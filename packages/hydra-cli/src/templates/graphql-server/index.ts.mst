import 'reflect-metadata';
import './config';
import { SnakeNamingStrategy } from '@subsquid/warthog';
import { snakeCase } from 'typeorm/util/StringUtils';
import { Logger } from './logger';
import { buildServerSchema, getServer } from './server';
import { startPgSubsribers } from './pubsub';

class CustomNamingStrategy extends SnakeNamingStrategy {
  tableName(className: string, customName?: string): string {
    return customName ? customName : `${snakeCase(className)}`;
  }
}

async function bootstrap() {
  const server = getServer({}, {
    namingStrategy: new CustomNamingStrategy(),
    maxQueryExecutionTime: 1000,
    logging: [ process.env.WARTHOG_DB_LOGGING || "error"]
  });

  await buildServerSchema(server);
  await startPgSubsribers();
  await server.start();
}

bootstrap().catch((error: Error) => {
  Logger.error(error);
  if (error.stack) {
    Logger.error(error.stack.split('\n'));
  }
  process.exit(1);
});
