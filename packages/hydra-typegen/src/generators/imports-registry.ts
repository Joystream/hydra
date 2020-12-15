import * as codecClasses from '@polkadot/types/codec'
import * as extrinsicClasses from '@polkadot/types/extrinsic'
import * as genericClasses from '@polkadot/types/generic'
import * as primitiveClasses from '@polkadot/types/primitive'
import * as interfaceDefinitions from '@polkadot/types/interfaces/definitions'
import { Json, Raw } from '@polkadot/types/codec'
import { ImportsRegistry } from './types'
import { CustomTypes } from '../commands/typegen'
import { warn } from '../log'

const debug = require('debug')('hydra-typegen:events-gen')

const KNOWN_LOCATIONS = {
  INTEFACES: '@polkadot/types/interfaces',
  TYPES: '@polkadot/types',
  TYPES_TYPES: '@polkadot/types/types',
  TYPES_CREATE: '@polkadot/types/create',
  METADATA: '@polkadot/metadata',
  LOCAL: '.',
  HYDRA_COMMON: '@dzlzv/hydra-common',
}

const NO_CODEC = ['Tuple', 'VecFixed']
const TYPES_TYPES = [
  'AnyNumber',
  'CallFunction',
  'Codec',
  'IExtrinsic',
  'ITuple',
]
const TYPES_CREATE = ['createTypeUnsafe', 'createType']
const METADATA = ['Metadata']
const LOCAL = ['typeRegistry']
const HYDRA_COMMON = ['substrate']

const primitive = {
  ...primitiveClasses,
  Json,
  Raw,
}

export function buildImportsRegistry(
  customTypes: CustomTypes | undefined
): ImportsRegistry {
  const importsRegistry = {}
  // add primitive classes
  const typeClasses = [
    ...Object.keys(primitiveClasses).filter(
      (name) => !name.includes('Generic')
    ),
    ...Object.keys(codecClasses as Record<string, unknown>).filter(
      (name) => !NO_CODEC.includes(name)
    ),
    ...Object.keys(genericClasses as Record<string, unknown>),
    ...Object.keys(extrinsicClasses as Record<string, unknown>),
  ]

  debug(`${typeClasses.join(',')}`)

  typeClasses.forEach((primitiveName) => {
    importsRegistry[primitiveName] = KNOWN_LOCATIONS.TYPES
  })

  for (const t of TYPES_TYPES) {
    importsRegistry[t] = KNOWN_LOCATIONS.TYPES_TYPES
  }

  for (const t of TYPES_CREATE) {
    importsRegistry[t] = KNOWN_LOCATIONS.TYPES_CREATE
  }

  for (const t of METADATA) {
    importsRegistry[t] = KNOWN_LOCATIONS.METADATA
  }

  for (const t of LOCAL) {
    importsRegistry[t] = KNOWN_LOCATIONS.LOCAL
  }

  for (const t of HYDRA_COMMON) {
    importsRegistry[t] = KNOWN_LOCATIONS.HYDRA_COMMON
  }

  addPolkadotInterfaces(importsRegistry)
  // this goes last so that it overrides all previous definitions
  if (customTypes) {
    addCustomTypes(importsRegistry, customTypes)
  }

  return importsRegistry
}

function addPolkadotInterfaces(importsRegistry: ImportsRegistry) {
  Object.entries(interfaceDefinitions).forEach(([, packageDef]): void => {
    Object.keys(packageDef.types).forEach((type): void => {
      if (importsRegistry[type]) {
        warn(
          `Overwriting duplicated type '${type}' ${importsRegistry[type]} -> ${KNOWN_LOCATIONS.INTEFACES}`
        )
      }
      importsRegistry[type] = KNOWN_LOCATIONS.INTEFACES
    })
  })
}

function addCustomTypes(
  importsRegistry: ImportsRegistry,
  customTypes: CustomTypes
) {
  const { defs, lib } = customTypes

  Object.keys(defs).forEach((type) => {
    if (importsRegistry[type]) {
      warn(
        `Overwriting duplicated type '${type}' ${importsRegistry[type]} -> ${lib}`
      )
    }
    importsRegistry[type] = lib
  })
}
