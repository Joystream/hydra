import { SubstrateEvent } from '@dzlzv/hydra-common'
import { expect } from 'chai'
import { format, stripSpaces } from '../util/utils'
import { buildFields, buildQuery, buildWhere } from './graphql-query-builder'

describe('Query builder', () => {
  it('should construct query where ', () => {
    const out = buildWhere({
      block: { gt: 100, lte: 500 },
      id: { gt: '3333' },
      name: { in: ['abc', 'cde'] },
    })

    const expected =
      'where: { block_gt: 100, block_lte: 500, id_gt: "3333", name_in: ["abc", "cde"] }'

    expect(out).equals(stripSpaces(expected))
  })

  it('should build query fields', () => {
    const out = buildFields<SubstrateEvent>([
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
      query: { where: { id: { in: ['0000'] } }, limit: 5 },
      fields: ['id'],
    })

    const expected = `test(where: { id_in: ["0000"] }, limit: 5) { id }`
    expect(out).equals(stripSpaces(expected))
  })
})
