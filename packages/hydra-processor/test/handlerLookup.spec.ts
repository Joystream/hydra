import { expect } from 'chai'
import { resolveArgType, resolveImports } from '../src/process'
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
})
