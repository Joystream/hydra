import { getRepository, Connection, createConnection } from 'typeorm'

import { ProcessedEventsLogEntity } from '../entities/ProcessedEventsLogEntity'
import Debug from 'debug'
import config from './ormconfig'
import { SanitizationSubscriber } from './subscribers'

const debug = Debug('hydra-processor:dal')

export async function createDBConnection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entities: any[] = []
): Promise<Connection> {
  const tmpConfig = config()
  const _config = {
    ...tmpConfig,
    subscribers: [...(tmpConfig.subscribers || []), SanitizationSubscriber],
  }

  entities.map((e) => _config.entities?.push(e))

  debug(`DB config: ${JSON.stringify(_config, null, 2)}`)
  return createConnection(_config)
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
