import { expect } from 'chai'
import FIFOCache from './FIFOCache'

describe('FIFOCache', () => {
  it('should return first key', () => {
    const cache = new FIFOCache<number, string>(10)
    cache.put(1, '1')
    cache.put(2, '2')

    expect(cache.firstKey()).to.equal(1)
  })

  it('should lookup keys and values', () => {
    const cache = new FIFOCache<number, string>(2)
    cache.put(1, '1')
    cache.put(2, '2')

    expect(cache.getKey('1')).to.equal(1)
    expect(cache.get(2)).to.equal('2')
  })

  it('should evict at max capacity', () => {
    const cache = new FIFOCache<number, string>(2)
    cache.put(1, '1')
    cache.put(2, '2')
    cache.put(3, '3')

    expect(cache.firstKey()).to.equal(2)
    expect(cache.size()).to.equal(2)
    expect(cache.getKey('1')).to.be.undefined
    expect(cache.get(1)).to.be.undefined

    expect(cache.get(3)).to.equal('3')
  })
})
