import { expect } from 'chai'
import { isInRange, parseRange } from './utils'

describe('utils', () => {
  it('should calculate in range', () => {
    expect(isInRange(4, { from: 4, to: 4 })).equal(true, '4 in [4,4]')
    expect(isInRange(5, { from: 4, to: 5 })).equal(true, '5 in [4, 5]')
    expect(isInRange(5, undefined)).equal(true, 'undefined includes everything')

    expect(isInRange(0, { from: 0, to: Number.POSITIVE_INFINITY })).equal(
      true,
      '0 in [0, +Infinity]'
    )

    expect(isInRange(-1, { from: 0, to: Number.POSITIVE_INFINITY })).equal(
      false,
      '-1 is not in [0, +Infinity]'
    )

    expect(isInRange(10, { from: 11, to: Number.POSITIVE_INFINITY })).equal(
      false,
      '10 is not in [11, +Infinity]'
    )
  })

  it('should parse range', () => {
    expect(parseRange(undefined)).to.include(
      { from: 0, to: Number.POSITIVE_INFINITY },
      'undefined'
    )
    expect(parseRange('[,]')).to.include(
      { from: 0, to: Number.POSITIVE_INFINITY },
      '[,]'
    )

    expect(parseRange('[2,]')).to.include(
      { from: 2, to: Number.POSITIVE_INFINITY },
      '[2,]'
    )
    expect(parseRange('(2,]')).to.include(
      { from: 3, to: Number.POSITIVE_INFINITY },
      '(2,]'
    )
    expect(parseRange('(2,4]')).to.include({ from: 3, to: 4 }, '(2,4]')
    expect(parseRange('(2,4)')).to.include({ from: 3, to: 3 }, '(2,4)')
    expect(parseRange('(2,)')).to.include(
      { from: 3, to: Number.POSITIVE_INFINITY },
      '(2,)'
    )
    expect(parseRange('(,5)')).to.include({ from: 0, to: 4 }, '(,5)')
    expect(parseRange('(,5]')).to.include({ from: 0, to: 5 }, '(,5]')

    expect(() => parseRange('(2,3)')).to.throw('empty', '(2,3)')
    expect(() => parseRange('[(,]')).to.throw('Malformed', '[(,]')
    expect(() => parseRange('[x,]')).to.throw('Malformed', '[x,]')

    expect(parseRange('(2,3]')).to.include({ from: 3, to: 3 }, '(2,3]')
    expect(parseRange('(-1,3]')).to.include({ from: 0, to: 3 }, '(-1,3]')
  })
})
