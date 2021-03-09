import {
  getRepository,
  Connection,
  EntityManager,
  createConnection,
  FindOneOptions,
} from 'typeorm'
import { DatabaseManager, DeepPartial } from '@dzlzv/hydra-common'
import { fillRequiredWarthogFields } from '@dzlzv/hydra-db-utils'
import { ProcessedEventsLogEntity } from '../entities/ProcessedEventsLogEntity'
import Debug from 'debug'
import config from './ormconfig'

const debug = Debug('hydra-processor:dal')

export async function createDBConnection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entities: any[] = []
): Promise<Connection> {
  const _config = config()
  entities.map((e) => _config.entities?.push(e))
  debug(`DB config: ${JSON.stringify(_config, null, 2)}`)
  return createConnection(_config)
}

export function makeDatabaseManager(
  entityManager: EntityManager
): DatabaseManager {
  return {
    save: async <T>(entity: DeepPartial<T>): Promise<void> => {
      entity = fillRequiredWarthogFields(entity)
      await entityManager.save(entity)
    },
    remove: async <T>(entity: DeepPartial<T>): Promise<void> => {
      await entityManager.remove(entity)
    },
    get: async <T>(
      entity: { new (...args: any[]): T },
      options: FindOneOptions<T>
    ): Promise<T | undefined> => {
      return await entityManager.findOne(entity, options)
    },
    getMany: async <T>(
      entity: { new (...args: any[]): T },
      options: FindOneOptions<T>
    ): Promise<T[]> => {
      return await entityManager.find(entity, options)
    },
  } as DatabaseManager
}

/**
 * Get last event processed by the given mappings processor
 *
 * @param processorID Name of the processor
 */
export async function loadState(
  processorID: string
): Promise<ProcessedEventsLogEntity | undefined> {
  return await getRepository(ProcessedEventsLogEntity).findOne({
    where: {
      processor: processorID,
    },
    order: {
      eventId: 'DESC',
      lastScannedBlock: 'DESC',
    },
  })
}

/**
 * Get last event processed by the given mappings processor
 *
 * @param processorID Name of the processor
 */
export async function countProcessedEvents(
  processorID: string
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { cnt } = await getRepository(ProcessedEventsLogEntity)
    .createQueryBuilder('events')
    .select('COUNT(DISTINCT(events.event_id))', 'cnt')
    .where({ processor: processorID })
    .getRawOne()

  debug(`Total events count ${String(cnt)}`)

  return Number.parseInt(cnt) || 0
}
