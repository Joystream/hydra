import { expect } from 'chai'
import { getIdFilter } from './GraphQLSource'
import { compact as c } from '../util/utils'
import { formatEventId } from '@subsquid/hydra-common'

describe('GraphQLSource query builder', () => {
  it('makes id filter with block.gt = 0', () => {
    const filter = getIdFilter({
      id: {},
      block: { gt: 0, lte: 0 },
    })

    expect(c(filter)).equals(
      c(`id: { _gt: "${formatEventId(0, 0)}", _lt: "${formatEventId(1, 0)}"}`)
    )
  })

  it('makes id filter with block.lte = 0', () => {
    const filter = getIdFilter({
      id: { gt: formatEventId(0, 0) },
      block: { gt: -1, lte: 0 },
    })

    expect(c(filter)).equals(
      c(`id: { _gt: "${formatEventId(0, 0)}", _lt: "${formatEventId(1, 0)}"}`)
    )
  })

  it('makes id filter with id_gt < block_gt', () => {
    const filter = getIdFilter({
      id: { gt: formatEventId(122, 4) },
      block: { gt: 123, lte: 3243 },
    })

    expect(c(filter)).equals(
      c(
        `id: { _gt: "${formatEventId(123, 0)}", _lt: "${formatEventId(
          3244,
          0
        )}"}`
      )
    )
  })

  it('makes id filter with id_gt > block_gt', () => {
    const filter = getIdFilter({
      id: { gt: formatEventId(122, 4) },
      block: { gt: 122, lte: 3243 },
    })

    expect(c(filter)).equals(
      c(
        `id: { _gt: "${formatEventId(122, 4)}", _lt: "${formatEventId(
          3244,
          0
        )}"}`
      )
    )
  })

  it('makes id filter with no block_lte', () => {
    const filter = getIdFilter({
      id: { gt: formatEventId(122, 4) },
      block: { gt: 122 },
    })

    expect(c(filter)).equals(c(`id: { _gt: "${formatEventId(122, 4)}"}`))
  })

  it('makes id filter with no id_gt', () => {
    const filter = getIdFilter({
      id: {},
      block: { gt: 122 },
    })

    expect(c(filter)).equals(c(`id: { _gt: "${formatEventId(122, 0)}" }`))
  })
})
