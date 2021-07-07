import { SubstrateEvent, DatabaseManager } from '@joystream/hydra-common'
import { TestEntity } from './test-entities'
import { EntityManager } from 'typeorm'
import { getMappingExecutor } from '../../src/executor'

/* eslint-disable */
export async function balances_Transfer(db: DatabaseManager, event: SubstrateEvent) {
  // try to save UTF-8 null character ('\0') to db -> will be checked by test
  await tryToSaveNullCharacter(db)
}

export async function balances_TransferCall() {}

export async function handleSudoEvent() {}
export async function handleSudoCall() {}
export async function preBlockHook1() {}
export async function preBlockHook2() {}
export async function postBlockHook1() {}
export async function postBlockHook2() {}

/*
  Tries to save UTF-8 null character ('\0') to db.
*/
async function tryToSaveNullCharacter(db: DatabaseManager) {
  const entityManager = (await getMappingExecutor() as any as {entityManager: EntityManager}).entityManager

  // save db prepare event mapping itself
  const dbCommand = async () => {
    // prepare text unacceptable by db (PostreSQL)
    const nullCharacter = '\0'

    // prepare new record
    const testEntity = new TestEntity({
        description: nullCharacter
        // intentionally omitting `alternativeDescription` - test will check that undefined key will pass
    })

    // try to save record to db
    await db.save<TestEntity>(testEntity)
  }

  // run db save in fail-safe environment
  await tryDbCommand(entityManager, dbCommand)
}

/*
  Tries to run db command and makes sure connection doesn't get broken if command fails.
*/
async function tryDbCommand(entityManager: EntityManager, dbCommand: () => Promise<void>) {
  const savepointName = 'temporarySavepoint'

  try {
    // save current transaction state
    await entityManager.query(`SAVEPOINT ${savepointName}`)

    // run db command that may fail
    await dbCommand()
  } catch (error) {
    // console.log('db error', error) // uncomment for debugging db error

    // rollback to savepoint
    await entityManager.query(`ROLLBACK TO SAVEPOINT ${savepointName}`)
  }

  // delete savepoint and continue like it never existed
  await entityManager.query(`RELEASE SAVEPOINT ${savepointName}`)
}
