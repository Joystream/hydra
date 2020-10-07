import * as dotenv from 'dotenv';
// we should set env variables before all other imports to avoid config errors or warthog caused by DI
dotenv.config( { path: './test/.env' });
import { createDb, dropDb } from '../utils';
import { QueryNodeManager } from '../../src';
import { before, after } from 'mocha';
import { createDBConnection } from '../../src/db/helper';
import * as Redis from 'ioredis';

const manager = new QueryNodeManager();

export async function setupDB(): Promise<void> {
  await createDb();
  await manager.migrate(); 
  await createDBConnection();
}

export async function clearRedis(): Promise<void> {
  const redisURL = process.env.REDIS_URI;
  if (!redisURL) {
    throw new Error(`Redis URL is not provided`);
  }
  const redis = new Redis(redisURL);
  await redis.flushall();

  await redis.quit();
}


before(async () => {
  try {
    await dropDb();
  } catch (e) {
    // ignore
  }
  try {
    await setupDB();  
    await clearRedis();
  } catch (e) {
    console.error(e);
  }
});

after(async () => {
  try {
    manager._onProcessExit();
    await dropDb();
  } catch (e) {
    console.error(e);
  }
})

