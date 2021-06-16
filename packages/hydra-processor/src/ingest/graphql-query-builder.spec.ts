import { SubstrateEvent } from '@joystream/hydra-common'
import { expect } from 'chai'
import { format, stripSpaces, compact as c } from '../util/utils'
import {
  buildQueryFields,
  buildQuery,
  buildWhere,
} from './graphql-query-builder'

describe('Query builder', () => {
  it('should construct blocks query', () => {
    const out = buildWhere<{
      height: number
      events: { name: string }[]
      extrinsics: { name: string }[]
    }>({
      height: { gt: 4234 },
      events: { some: { name: { in: ['abc', 'cde'] } } },
      extrinsics: { some: { name: { in: ['xyz', 'qqq'] } } },
    })

    const expected = ` where: { height_gt: 4234, events_some: { name_in: ["abc", "cde"]}, extrinsics_some: { name_in: ["xyz", "qqq"]}}`

    expect(c(out)).equals(c(expected))
  })

  it('should construct query where ', () => {
    const out = buildWhere<{ block: number; id: string; name: string }>({
      block: { gt: 100, lte: 500 },
      id: { gt: '3333' },
      name: { in: ['abc', 'cde'] },
    })

    const expected =
      'where: { block_gt: 100, block_lte: 500, id_gt: "3333", name_in: ["abc", "cde"] }'

    expect(out).equals(stripSpaces(expected))
  })

  it('should build query fields', () => {
    const out = buildQueryFields<SubstrateEvent>([
      'id',
      'name',
      'method',
      { 'params': ['name', 'type', 'value'] },
      'indexInBlock',
      'blockNumber',
      'blockTimestamp',
    ])
    console.log(out)
    const expected = `
        id
        name
        method
        params {
          name
          type
          value
        }
        indexInBlock
        blockNumber
        blockTimestamp
      `

    expect(out).equals(format(expected))
  })

  it('should build a query', () => {
    const out = buildQuery<SubstrateEvent>({
      name: 'test',
      query: {
        where: { id: { in: ['0000'] } },
        limit: 5,
        orderBy: { asc: 'id' },
      },
      fields: ['id'],
    })

    const expected = `test(where: { id_in: ["0000"] }, limit: 5, orderBy: id_ASC) { id }`
    expect(out).equals(stripSpaces(expected))
  })
})
