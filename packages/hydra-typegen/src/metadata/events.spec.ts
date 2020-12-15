import { strippedArgTypes } from './events'
import { Event } from './types'
import { expect } from 'chai'

describe('events', () => {
  it('should parse arg types', () => {
    const event = ({
      args: [
        'Vec<u32>',
        'AccountId & Codec',
        'Balance | LookupSource<Balance>',
      ],
      name: 'testEvent',
    } as unknown) as Event
    const types = strippedArgTypes(event)
    console.log(types.join(','))

    expect(types).to.include.members(['Vec', 'u32'])
    expect(types).to.include.members(['AccountId', 'Codec'])
    expect(types).to.include.members(['Balance', 'LookupSource'])
    expect(types.length).to.equal(6, 'Should contain 6 types')
  })
})
