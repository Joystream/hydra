import { expect } from 'chai'
import tmp from 'tmp'
import { GeneratorConfig, generateTypeRegistry } from '../src/generators'
import path from 'path'
import fs from 'fs'
import { TypeRegistry } from '@polkadot/types'

describe('gen-typeRegistry', () => {
  it('should create the metadata file', () => {
    const dest = tmp.dirSync().name
    const registry = new TypeRegistry()
    generateTypeRegistry({
      originalMetadata: registry.createType('Metadata', {
        metadata: { v14: {} },
      }),
      dest,
    } as unknown as GeneratorConfig)
    expect(fs.existsSync(path.join(dest, 'metadata.json'))).equal(true)
  })
})
