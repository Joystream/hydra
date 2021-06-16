import { ImportsRegistry } from './types'
import { CustomTypes } from '../commands/typegen'
import { warn } from '../log'
import { builtInClasses, builtInInterfaceDefs } from '../metadata/default-types'
import { registerCustomTypes } from '../metadata'

const debug = require('debug')('hydra-typegen:imports-registry')

const KNOWN_LOCATIONS = {
  interfaces: '@polkadot/types/interfaces',
  types: '@polkadot/types',
  typesTypes: '@polkadot/types/types',
  typesCreate: '@polkadot/types/create',
  metadata: '@polkadot/metadata',
  local: '.',
  hydraCommon: '@subsquid/hydra-common',
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

export function buildImportsRegistry(
  customTypes: CustomTypes | undefined
): ImportsRegistry {
  const importsRegistry = {}
  // add primitive classes
  const typeClasses = builtInClasses.filter((name) => !NO_CODEC.includes(name))

  debug(`Built-in classes: ${typeClasses.join(',')}`)

  typeClasses.forEach((primitiveName) => {
    importsRegistry[primitiveName] = KNOWN_LOCATIONS.types
  })

  for (const t of TYPES_TYPES) {
    importsRegistry[t] = KNOWN_LOCATIONS.typesTypes
  }

  for (const t of TYPES_CREATE) {
    importsRegistry[t] = KNOWN_LOCATIONS.typesCreate
  }

  for (const t of METADATA) {
    importsRegistry[t] = KNOWN_LOCATIONS.metadata
  }

  for (const t of LOCAL) {
    importsRegistry[t] = KNOWN_LOCATIONS.local
  }

  for (const t of HYDRA_COMMON) {
    importsRegistry[t] = KNOWN_LOCATIONS.hydraCommon
  }

  addPolkadotInterfaces(importsRegistry)
  // this goes last so that it overrides all previous definitions
  if (customTypes) {
    addCustomTypes(importsRegistry, customTypes)
  }

  return importsRegistry
}

function addPolkadotInterfaces(importsRegistry: ImportsRegistry) {
  Object.entries(builtInInterfaceDefs).forEach(([, packageDef]): void => {
    Object.keys(packageDef.types).forEach((type): void => {
      if (importsRegistry[type]) {
        warn(
          `Overwriting duplicated type '${type}' ${importsRegistry[type]} -> ${KNOWN_LOCATIONS.interfaces}`
        )
      }
      importsRegistry[type] = KNOWN_LOCATIONS.interfaces
    })
  })
}

function addCustomTypes(
  importsRegistry: ImportsRegistry,
  customTypes: CustomTypes
) {
  const { lib, typedefsLoc } = customTypes

  const defs = registerCustomTypes(typedefsLoc)

  Object.keys(defs).forEach((type) => {
    if (importsRegistry[type]) {
      warn(
        `Overwriting duplicated type '${type}' ${importsRegistry[type]} -> ${lib}`
      )
    }
    importsRegistry[type] = lib
  })
}
