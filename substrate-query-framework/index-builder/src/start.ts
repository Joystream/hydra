import { HydraServer } from './HydraServer';
import { numberEnv } from './utils/env-flags';
import { createDBConnection } from './db/helper';
import { Logger } from '@overnightjs/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const port = numberEnv(`HYDRA_SERVER_PORT`) || 4001;

createDBConnection().then(() => {
  const server = new HydraServer();
  server.start(port);

}).catch((e) => Logger.Err(`Error connecting the database, ${JSON.stringify(e, null, 2)}`));
