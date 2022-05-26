import { ApiPromise } from '@polkadot/api'
import { assert } from 'chai'
import { transfer, createApi } from './api/substrate-api'
import * as dotenv from 'dotenv'
import Container from 'typedi'
import pWaitFor from 'p-wait-for'
import { Connection, EntityManager } from 'typeorm'
import { parseManifest } from '../src/start/manifest'
import { createDBConnection } from '../src/db'
import { TestEntity } from './fixtures/test-entities'
import { ProcessedEventsLogEntity } from '../src/entities/ProcessedEventsLogEntity'
import * as path from 'path'

// You need to be connected to a development chain for this example to work.
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'

const txAmount = 10000

describe('MappingsProcessor', () => {
  const environment = setupEnvironment()

  it('sanitizes UTF-8 null character(s)', async () => {
    // this test relies on mapping balances_Transfer - see fixtures/test-mappings.ts

    const db = environment.db.manager

    // transfer balance from Alice to Bob (transfer has mapping associated)
    const blockHeight = await transfer(ALICE, BOB, txAmount)

    // make sure mappings block has been processed
    await waitForProcessorToCatchUp(db, blockHeight)

    // retrieve db record created by event mapping
    const testEntity = await db.findOne(TestEntity, {
      where: {}, // required by typeorm '0.3.5'
      order: { primaryKey: 'DESC' },
    })

    // ensure entity was sucessfully saved in mapping
    assert.isOk(testEntity)

    // this escape is teoretically not needed, but chai types misses assert guards (available in TS 3.7+)
    if (!testEntity) {
      return
    }

    // ensure UTF-8 null character(s) were replaced by empty string
    assert.equal(testEntity.description, '')
  })
})

/*
  Prepare common environment needed for tests' runs.
*/
function setupEnvironment() {
  // ensure WebSocket is available globally (facilitates outside connection)
  globalThis.WebSocket = require('ws')

  const environment: { db: Connection } = {
    db: null as any,
  }

  before(async () => {
    // load configuration and create api
    dotenv.config({ path: path.join(__dirname, '/.env') })
    await createApi(process.env.WS_PROVIDER_URI || '')

    // synchronize db
    environment.db = await synchronizeDb()
  })

  after(async () => {
    // close api connection
    const api = Container.get<ApiPromise>('ApiPromise')
    await api.disconnect()

    // disconnect db if needed
    if (environment.db) {
      return environment.db.close()
    }
  })

  return environment
}

/*
  Synchronizes DB with entites from both test manifest.
*/
async function synchronizeDb() {
  // read test manifest
  const manifest = parseManifest(path.join(__dirname, '/fixtures/manifest.yml'))

  // connect to db
  const connection = await createDBConnection(manifest.entities)

  // synchronize defined typeorm entites with database
  await connection.synchronize()

  return connection
}

/*
  Periodically checks processor block information from the database and waits until the given block is processed.
*/
async function waitForProcessorToCatchUp(
  db: EntityManager,
  blockHeight: number
) {
  // wait until the indexer indexes the block and the processor picks it up
  await pWaitFor(
    async () => {
      try {
        const record = await db.findOne(ProcessedEventsLogEntity, {
          where: { lastScannedBlock: blockHeight },
        })

        return !!record
      } catch (error) {
        // catch error thrown if db has not been initialized yet
        return false
      }
    },
    { interval: 50 }
  )
}
