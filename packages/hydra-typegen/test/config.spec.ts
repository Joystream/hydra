import expect = require('expect')
import * as path from 'path'
import { loadConfig, validateConfig } from '../src/config'

function fixture(name: string) {
  return path.resolve(__dirname, 'fixtures', name)
}

describe('config', () => {
  it('should parse config file', () => {
    const config = loadConfig(fixture('config.yml'))
    expect(config).toEqual({
      outDir: './generated',
      metadata: {
        source: 'wss://kusama-rpc.polkadot.io',
        blockHash:
          '0x45eb7ddd324361adadd4f8cfafadbfb7e0a26393a70a70e5bee6204fc46af62e',
      },
      events: ['balances.Transfer'],
      calls: ['balances.transfer'],
      customTypes: {
        lib: 'testing',
        typedefsLoc: 'test/fixtures/typedefs.json',
      },
    })
  })

  it('should throw if no events or calls were defined', () => {
    expect(() => validateConfig({ outDir: 'foo', events: [] })).toThrow(
      'Nothing to generate'
    )
  })

  it('should throw if it cannot locate typedef files', () => {
    expect(() =>
      validateConfig({
        outDir: 'foo',
        events: ['a'],
        calls: ['b'],
        customTypes: { typedefsLoc: 'non-existent', lib: 'bar' },
      })
    ).toThrow('Cannot find type definition')
  })

  it('should locate type definitions', () => {
    expect(() =>
      validateConfig({
        outDir: 'foo',
        events: ['a'],
        calls: ['b'],
        customTypes: { typedefsLoc: 'test/fixtures/typedefs.json', lib: 'bar' },
      })
    ).not.toThrow()
  })
})
