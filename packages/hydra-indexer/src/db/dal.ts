import {
  QueryRunner,
  getRepository,
  Connection,
  createConnection,
} from 'typeorm'
import { EVENT_TABLE_NAME } from '../entities/SubstrateEventEntity'
import { doInTransaction } from '@dzlzv/hydra-db-utils'
import Debug from 'debug'
import config from './ormconfig'

const debug = Debug('index-builder:helper')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createDBConnection(
  entities: any[] = []
): Promise<Connection> {
  // const connectionOptions = await getConnectionOptions();
  const _config = config()
  entities.map((e) => _config.entities?.push(e))
  debug(`DB config: ${JSON.stringify(_config, null, 2)}`)
  return createConnection(_config)
}

export async function getIndexerHead(): Promise<number> {
  return await doInTransaction(async (qr: QueryRunner) => {
    const raw = (await qr.query(`
      SELECT block_number 
      FROM ${EVENT_TABLE_NAME} e1 
      WHERE 
        NOT EXISTS (
          SELECT 
            NULL FROM ${EVENT_TABLE_NAME} e2 
          WHERE e2.block_number = e1.block_number + 1) 
        ORDER BY block_number
      LIMIT 1`)) as Array<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    if (raw === undefined || raw.length === 0) {
      return -1
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Number(raw[0].block_number)
  })
}
