import { BlockData } from '../queue'
import { EntityManager } from 'typeorm'

/**
 * A transactional event context
 */
export interface TxAwareBlockContext extends BlockData {
  /**
   * A TypeORM entityManager holding the DB transaction within which the mapping batch is executed
   */
  entityManager: EntityManager
}

/**
 *
 * @param ctx Event
 * @returns If the event context has been enriched with a transactional EntityManager
 */
export function isTxAware(ctx: BlockData): ctx is TxAwareBlockContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx as any).entityManager !== undefined
}
