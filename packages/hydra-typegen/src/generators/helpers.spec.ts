import { expect } from 'chai'
import { nameFromType } from '.'

describe('helpers', () => {
  it('should name from arg type', () => {
    expect(nameFromType('Compact<Balance> & Codec')).to.equal('balance')
    expect(nameFromType('MyLongType & Codec')).to.equal('myLongType')
    expect(nameFromType('SimpleType')).to.equal('simpleType')
  })
})
