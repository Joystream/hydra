import { expect } from 'chai'
import { defaultName, parseBlockInterval } from './manifest'

describe('manifest', () => {
  it('parses block intervals', () => {
    const empty = parseBlockInterval(undefined)
    expect(empty.from).equals(0)
    expect(empty.to).equals(Number.MAX_SAFE_INTEGER)

    const left = parseBlockInterval('[42,]')
    expect(left).not.to.be.an('undefined')
    expect(left.from).equals(42, 'should read the from block')
    expect(left.to).equals(Number.MAX_SAFE_INTEGER)

    const right = parseBlockInterval('[,42]')
    expect(right).not.to.be.an('undefined')
    expect(right.to).equals(42, 'should read the to block')
    expect(right.from).equals(0)

    const both = parseBlockInterval(' [ 2 , 42 ] ')
    expect(both).not.to.be.an('undefined')
    expect(both.from).equals(2, 'should read the from block')
    expect(both.to).equals(42, 'should read the from block')
  })

  it('infers default handler names', () => {
    const name = defaultName('Balances.Transfer', 'Event')

    expect(name).equals('balances_TransferEvent')
  })
})
