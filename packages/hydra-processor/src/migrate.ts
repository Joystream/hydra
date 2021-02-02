import { Connection } from 'typeorm'
import { createDBConnection } from './db'
import { error, info } from './util/log'

/**
 * Run migrations in the "migrations" folder;
 */
export async function migrate(): Promise<void> {
  let connection: Connection | undefined
  try {
    connection = await createDBConnection()
    if (connection) await connection.runMigrations()
  } finally {
    if (connection) await connection.close()
  }
}

info('Running migrations for Hydra Processor')
migrate()
  .then(() => info('Hydra Processor migrations completed successfully'))
  .catch((e) => {
    error(`Error running migrations: ${JSON.stringify(e)}`)
    process.exit(1)
  })
