import { expect } from 'chai'
import { IConfig } from '../src/commands/typegen'
import { parseConfigFile } from '../src/config/parse-yaml'
import { validate } from '../src/config/validate'
import path from 'path'

describe('config', () => {
  it('should parse config file', () => {
    const config = parseConfigFile(path.resolve('test/fixtures/config.yml'))
    expect(config.metadata.source).not.to.be.an('undefined')
  })

  it('should throw if no events or calls were defined', () => {
    expect(() =>
      validate({ events: [], calls: [] } as unknown as IConfig)
    ).to.throw('Nothing to generate')
  })
})
