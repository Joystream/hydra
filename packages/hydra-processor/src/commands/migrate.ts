import { Command, flags } from '@oclif/command'
import { Connection } from 'typeorm'
import { createDBConnection } from '../db'
import { info } from '../util/log'
import dotenv from 'dotenv'

export default class Migrate extends Command {
  static flags = {
    env: flags.string({
      char: 'e',
      description: 'Path to a file with environment variables',
      default: './.env',
    }),
  }

  async run(): Promise<void> {
    let connection: Connection | undefined
    info('Running migrations for Hydra Processor')

    const { flags } = this.parse(Migrate)

    dotenv.config({ path: flags.env })
    process.env.PGDATABASE = process.env.DB_NAME
    process.env.PGUSER = process.env.DB_USER
    process.env.PGPASSWORD = process.env.DB_PASS
    process.env.PGPORT = process.env.DB_PORT
    process.env.PGHOST = process.env.DB_HOST

    try {
      connection = await createDBConnection()
      if (connection) await connection.runMigrations()
      info('Hydra Processor migrations completed successfully')
    } finally {
      if (connection) await connection.close()
    }
  }
}
