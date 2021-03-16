import { expect } from 'chai'
import tmp from 'tmp'
import { GeneratorConfig, generateIndex } from '../src/generators'
import path from 'path'
import fs from 'fs'

describe('gen-index', () => {
  it('should copy type definition file', () => {
    const dest = tmp.dirSync().name
    generateIndex(({
      modules: [],
      customTypes: { typedefsLoc: 'test/fixtures/typedefs.json' },
      dest,
    } as unknown) as GeneratorConfig)
    expect(fs.existsSync(path.join(dest, 'typedefs.json'))).equal(true)
  })
})
