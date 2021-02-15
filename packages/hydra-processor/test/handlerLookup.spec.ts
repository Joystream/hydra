import { SubstrateEvent } from '@dzlzv/hydra-common'
import { DatabaseManager } from '@dzlzv/hydra-db-utils'
import { expect } from 'chai'
import {
  ContextArgs,
  createArgs,
  resolveArgType,
  resolveImports,
} from '../src/process'
import { manifest } from './manifest.spec'

const { imports } = manifest.mappings
let resolvedImports: Record<string, unknown>
let balancesTransferType: any

describe('HandlerLookupsService', () => {
  before(async () => {
    resolvedImports = await resolveImports(imports)
    balancesTransferType = resolveArgType(
      'Balances.TransferEvent',
      resolvedImports
    )
  })

  it('resolves imports and finds a prototype', async () => {
    expect(balancesTransferType.prototype).not.to.be.an('undefined')
  })

  it('instantiates args', () => {
    const ctxArgs = {
      dbStore: {} as DatabaseManager,
      context: {} as SubstrateEvent,
    } as ContextArgs

    const prototypes = {
      'Balances.TransferEvent': balancesTransferType.prototype,
    }

    const args = createArgs(
      ['DatabaseManager', 'SubstrateEvent', 'Balances.TransferEvent'],
      ctxArgs,
      prototypes
    )

    expect(args[0]).not.to.be.an('undefined', 'dbstore should be created')
    expect(args[1]).not.to.be.an('undefined', 'context should be created')
    expect(args[2].testProp).to.be.equal(
      'TestProp',
      'should create an object by prototype'
    )
  })
})
