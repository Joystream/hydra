import { getRepository, Connection, createConnection, EntitySubscriberInterface, MixedList } from 'typeorm'

import { ProcessedEventsLogEntity } from '../entities/ProcessedEventsLogEntity'
import Debug from 'debug'
import config from './ormconfig'
import { SanitizationSubscriber } from './subscribers'

const debug = Debug('hydra-processor:dal')

export async function createDBConnection(
  entities: ReturnType<typeof config>['entities'] = []
): Promise<Connection> {
  function mixedListToArray<T>(mixedList: MixedList<T> | undefined): T[] {
    return mixedList
      ? Array.isArray(mixedList)
        ? mixedList
        : Object.values(mixedList)
      : []
  }

  const tmpConfig = config()

  const _config = {
    ...tmpConfig,
    subscribers: mixedListToArray(tmpConfig.subscribers).concat([SanitizationSubscriber]),
    entities: mixedListToArray(tmpConfig.entities).concat(mixedListToArray(entities)),
  }

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
  const item = await getRepository(ProcessedEventsLogEntity).findOne({
    where: {
      processor: processorID,
    },
    order: {
      eventId: 'DESC',
      lastScannedBlock: 'DESC',
    },
  })

  return item || undefined
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
  const { cnt } = (await getRepository(ProcessedEventsLogEntity)
    .createQueryBuilder('events')
    .select('COUNT(DISTINCT(events.event_id))', 'cnt')
    .where({ processor: processorID })
    .getRawOne()) || { cnt: 0 }

  debug(`Total events count ${String(cnt)}`)

  return Number.parseInt(cnt) || 0
}
