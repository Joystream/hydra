import { expect } from 'chai'
import { defaultHandlerName, extractName, extractTypes } from './manifest'

describe('manifest', () => {
  it('parses types', () => {
    let types = extractTypes(
      `balancesTransfer(DatabaseManager, Balances.TransferEvent)`
    )
    expect(types.length).equals(2)
    expect(types[0]).equals('DatabaseManager')
    expect(types[1]).equals('Balances.TransferEvent')

    types = extractTypes(`balancesTransfer`)
    expect(types.length).equals(0)

    types = extractTypes(`balancesTransfer()`)
    expect(types.length).equals(0)

    expect(() => extractTypes('balancesTransfer(')).to.throw(
      'Malformed',
      'balancesTransfer('
    )
    expect(() => extractTypes('balancesTransfer(a,,b)')).to.throw(
      'Malformed',
      'balancesTransfer(a,,b)'
    )
    expect(() => extractTypes('balancesTransfer(,b)')).to.throw(
      'Malformed',
      'balancesTransfer(,b)'
    )
  })

  it('parses name', () => {
    let name = extractName(
      `balancesTransfer(DatabaseManager, Balances.TransferEvent)`
    )
    expect(name).equals('balancesTransfer')
    name = extractName(`balancesTransfer()`)
    expect(name).equals('balancesTransfer')
    name = extractName(`balancesTransfer`)
    expect(name).equals('balancesTransfer')
  })

  it('infers default handler names', () => {
    let name = defaultHandlerName({ event: 'Balances.Transfer' })

    expect(name).equals('balances_Transfer')

    name = defaultHandlerName({ event: 'data_directory.ContentRemoved' })
    expect(name).equals('dataDirectory_ContentRemoved')

    name = defaultHandlerName({ extrinsic: 'balances.transfer' })
    expect(name).equals('balances_TransferCall')
  })
})
