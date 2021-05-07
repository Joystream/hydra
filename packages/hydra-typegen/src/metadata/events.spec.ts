import { stripTypes } from './extract'
import { expect } from 'chai'

describe('events', () => {
  it('should parse arg types', () => {
    const argTypes = [
      'Vec<u32>',
      'AccountId & Codec',
      'Balance | LookupSource<Balance>',
      'Vec<(CategoryId,ThreadId,PostId,bool)>',
    ]
    const types = stripTypes(argTypes)
    console.log(types.join(','))

    expect(types).to.include.members(['Vec', 'u32'])
    expect(types).to.include.members(['AccountId', 'Codec'])
    expect(types).to.include.members(['Balance', 'LookupSource'])
    expect(types).to.include.members([
      'Vec',
      'CategoryId',
      'ThreadId',
      'PostId',
      'bool',
    ])
  })
})
