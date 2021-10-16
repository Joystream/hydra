const self = require('../../package.json')
const reader = require('@subsquid/openreader/package.json')

export const hydra = self.version
export const openreader = self.dependencies['@subsquid/openreader']
export const polkadot = self.devDependencies['@polkadot/types']
export const inflected = reader.dependencies.inflected
export const inflectedTypes = reader.devDependencies['@types/inflected']
export const pgTypes = reader.devDependencies['@types/pg']
export const typeorm = self.devDependencies.typeorm
export const typeGraphql = '^1.1.1'
export const classValidator = '^0.13.1'
export const typeScript = self.devDependencies.typescript
