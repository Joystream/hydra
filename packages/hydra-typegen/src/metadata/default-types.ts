import * as codecClasses from '@polkadot/types/codec'
import * as extrinsicClasses from '@polkadot/types/extrinsic'
import * as genericClasses from '@polkadot/types/generic'
import * as primitiveClasses from '@polkadot/types/primitive'
import * as interfaceDefinitions from '@polkadot/types/interfaces/definitions'

const primitive = [...Object.keys(primitiveClasses), 'Json', 'Raw']

export const builtInClasses = [
  ...primitive,
  ...Object.keys(codecClasses as Record<string, unknown>),
  ...Object.keys(genericClasses as Record<string, unknown>),
  ...Object.keys(extrinsicClasses as Record<string, unknown>),
]

export const builtInInterfaceDefs = interfaceDefinitions
