import { expect } from 'chai'
import {
  EMPTY_RANGE,
  intersect,
  isInRange,
  parseRange,
  unionAll,
  unionWith,
} from './ranges'

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

  it('should intersect two ranges', () => {
    expect(intersect({ from: 0, to: 10 }, { from: 6, to: 11 })).to.deep.eq({
      from: 6,
      to: 10,
    })
    expect(intersect({ from: 0, to: 5 }, { from: 6, to: 11 })).to.be.eq(
      EMPTY_RANGE
    )

    expect(
      intersect({ from: 0, to: 5 }, { from: 3, to: Number.POSITIVE_INFINITY })
    ).to.deep.eq({ from: 3, to: 5 })

    expect(intersect({ from: 0, to: 5 }, EMPTY_RANGE)).to.be.eq(EMPTY_RANGE)
  })

  it('should intersect one range and an aray', () => {
    expect(
      unionWith({ from: 3, to: 10 }, [
        { from: 0, to: 4 },
        { from: 6, to: 7 },
        { from: 9, to: 11 },
      ])
    ).to.deep.include({
      from: 0,
      to: 11,
    })

    expect(
      unionWith({ from: 5, to: 10 }, [
        { from: 0, to: 4 },
        { from: 6, to: 7 },
        { from: 9, to: 11 },
      ])
    ).to.have.deep.members([
      { from: 0, to: 4 },
      { from: 5, to: 11 },
    ])

    expect(
      unionWith({ from: 5, to: 10 }, [
        { from: 0, to: 4 },
        { from: 6, to: 7 },
        { from: 9, to: 11 },
        { from: 13, to: 16 },
      ])
    ).to.have.deep.members([
      {
        from: 0,
        to: 4,
      },
      { from: 5, to: 11 },
      { from: 13, to: 16 },
    ])
  })

  it('should intersect two range arrays', () => {
    expect(
      unionAll(
        [
          { from: 1, to: 3 },
          { from: 5, to: 7 },
          { from: 9, to: 11 },
        ],
        [
          { from: 0, to: 2 },
          { from: 4, to: 6 },
          { from: 8, to: 10 },
        ]
      )
    ).to.have.deep.members([
      { from: 0, to: 3 },
      { from: 4, to: 7 },
      { from: 8, to: 11 },
    ])
  })
})
