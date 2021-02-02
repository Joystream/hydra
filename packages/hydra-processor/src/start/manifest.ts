import YAML from 'yaml'
import YamlValidator from 'yaml-validator'
import fs from 'fs'
import path from 'path'
import semver from 'semver'

import { camelCase, countBy, endsWith } from 'lodash'

import { HandlerFunc } from './QueryEventProcessingPack'
import { resolvePackageVersion } from '../util/utils'
import { warn } from '../util/log'

export const STORE_CLASS_NAME = 'DatabaseManager'
export const EVENT_SUFFIX = 'Event'
export const CALL_SUFFIX = 'Call'

const manifestValidatorOptions = {
  structure: {
    version: 'string',
    'description?': 'string',
    'repository?': 'string',
    dataSource: {
      kind: 'string',
      chain: 'string',
      indexerVersion: 'string',
    },
    entities: ['string'],
    mappings: {
      hydraCommonVersion: 'string',
      mappingsModule: 'string',
      'blockInterval?': 'string',
      'eventHandlers?': [
        {
          event: 'string',
          'handler?': 'string',
        },
      ],
      'extrinsicHandlers?': [
        {
          extrinsic: 'string',
          'handler?': 'string',
        },
      ],
      'preBlockHooks?': ['string'],
      'postBlockHooks?': ['string'],
    },
  },

  onWarning: function (error: unknown, filepath: unknown) {
    throw new Error(`${filepath} has error: ${JSON.stringify(error)}`)
  },
}

export interface DataSource {
  kind: string
  chain: string
  indexerVersion: string
}

interface MappingsDefInput {
  hydraCommonVersion: string
  mappingsModule: string
  blockInterval?: string
  eventHandlers?: Array<{ event: string; handler?: string }>
  extrinsicHandlers?: Array<{ extrinsic: string; handler?: string }>
  preBlockHooks?: string[]
  postBlockHooks?: string[]
}

export interface MappingsDef {
  hydraCommonVersion: string
  mappingsModule: Record<string, unknown>
  blockInterval: BlockInterval
  eventHandlers: Record<string, MappingHandler>
  extrinsicHandlers: Record<string, MappingHandler>
  preBlockHooks: MappingHandler[]
  postBlockHooks: MappingHandler[]
}

export interface BlockInterval {
  from: number
  to: number
}

export interface MappingHandler {
  // blockInterval?: BlockInterval TODO: do we need per-handler block intervals?
  handlerFunc: HandlerFunc
  argTypes: string[]
}

export interface ProcessorManifest {
  version: string
  entities: string[]
  description?: string
  repository?: string
  dataSource: DataSource
  mappings: MappingsDef
}

export function parseManifest(manifestLoc: string): ProcessorManifest {
  const validator = new YamlValidator(manifestValidatorOptions)
  validator.validate([manifestLoc])

  if (validator.report()) {
    throw new Error(
      `Failed to load the manifest file at location ${manifestLoc}: ${validator.logs.join(
        '\n'
      )}`
    )
  }
  const parsed = YAML.parse(fs.readFileSync(manifestLoc, 'utf8')) as {
    version: string
    entities: string[]
    description?: string
    repository?: string
    dataSource: DataSource
    mappings: MappingsDefInput
  }

  const { mappings, entities } = parsed
  validate(mappings)

  return {
    ...parsed,
    entities: entities.map((e) => path.resolve(e.trim())),
    mappings: inferDefaults(mappings),
  }
}

function validate(parsed: MappingsDefInput): void {
  if (
    parsed.eventHandlers === undefined &&
    parsed.extrinsicHandlers === undefined
  ) {
    throw new Error(`At least one event or extrinsic handler must be defined`)
  }

  const oursHydraCommonVersion = resolvePackageVersion('@dzlzv/hydra-common')
  if (!semver.satisfies(parsed.hydraCommonVersion, oursHydraCommonVersion)) {
    throw new Error(`The hydra-common version ${parsed.hydraCommonVersion} does \\
not satisfy the version of the processor (${oursHydraCommonVersion})`)
  }
}

function inferDefaults(parsed: MappingsDefInput): MappingsDef {
  const {
    hydraCommonVersion,
    mappingsModule,
    blockInterval,
    eventHandlers,
    extrinsicHandlers,
    preBlockHooks,
    postBlockHooks,
  } = parsed

  if (mappingsModule === undefined) {
    throw new Error(`Cannot resolve mappings module ${mappingsModule}`)
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const resolvedModule = require(mappingsModule) as Record<string, unknown>

  const parseHandler = function (def: {
    input?: string
    handler?: string
    suffix?: string
  }): MappingHandler {
    const { input, handler, suffix } = def
    const { name, argTypes } = handler
      ? parseHandlerDef(handler)
      : inferDefault(input || '', suffix)
    return {
      argTypes,
      handlerFunc: resolveHandler(resolvedModule, name),
    }
  }

  return {
    hydraCommonVersion,
    mappingsModule: resolvedModule,
    blockInterval: parseBlockInterval(blockInterval),
    eventHandlers: eventHandlers
      ? eventHandlers.reduce((acc, item) => {
          acc[item.event] = parseHandler({
            ...item,
            input: item.event,
            suffix: EVENT_SUFFIX,
          })
          return acc
        }, {} as Record<string, MappingHandler>)
      : {},
    extrinsicHandlers: extrinsicHandlers
      ? extrinsicHandlers.reduce((acc, item) => {
          acc[item.extrinsic] = parseHandler({
            ...item,
            input: item.extrinsic,
            suffix: CALL_SUFFIX,
          })
          return acc
        }, {} as Record<string, MappingHandler>)
      : {},
    preBlockHooks: preBlockHooks
      ? preBlockHooks.map((handler) => parseHandler({ handler }))
      : [],
    postBlockHooks: postBlockHooks
      ? postBlockHooks.map((handler) => parseHandler({ handler }))
      : [],
  }
}

export function parseHandlerDef(
  handler: string
): { name: string; argTypes: string[] } {
  // eslint-disable-next-line no-useless-escape
  const split = handler.split(/[\(\)]/).map((s) => s.trim())
  // name(arg1, arg2, arg3) -> ["name", "arg1,arg2,arg3"]
  if (split.length !== 3) {
    throw new Error(
      `The mapping handler definition ${handler} does not match the pattern "name(type1, type2, ...)`
    )
  }
  const name = split[0]

  const argTypes = split[1].split(/,/).map((s) => s.trim())

  validateArgTypes({ handler, argTypes })

  return { name, argTypes }
}

export function validateArgTypes({
  handler,
  argTypes,
}: {
  handler: string
  argTypes: string[]
}): void {
  if (argTypes.length === 0) {
    throw new Error(`Handler ${handler} must have at least one argument`)
  }

  const typeOccurrences = countBy(argTypes)

  if (!typeOccurrences[STORE_CLASS_NAME]) {
    warn(
      `Handler ${handler} does not have an argument of type ${STORE_CLASS_NAME}`
    )
  }

  if (
    typeOccurrences[STORE_CLASS_NAME] &&
    typeOccurrences[STORE_CLASS_NAME] > 1
  ) {
    throw new Error(
      `Handler ${handler} has multiple arguments of type ${STORE_CLASS_NAME}`
    )
  }

  const eventTypeCnt = argTypes.reduce(
    (acc, item: string) => (endsWith(item, EVENT_SUFFIX) ? acc + 1 : acc),
    0
  )

  if (eventTypeCnt > 1) {
    throw new Error(`Handler ${handler} has multiple arguments of event type`)
  }

  const callTypeCnt = argTypes.reduce(
    (acc, item: string) => (endsWith(item, CALL_SUFFIX) ? acc + 1 : acc),
    0
  )

  if (callTypeCnt > 1) {
    throw new Error(`Handler ${handler} has multiple arguments of call type`)
  }
}

export function inferDefault(
  input: string,
  suffix?: string
): { name: string; argTypes: string[] } {
  const [module, name] = input.split('.').map((s) => s.trim())

  return {
    name: `${camelCase(module)}_${name}${suffix || ''}`,
    argTypes: [STORE_CLASS_NAME, `${module}.${name}${suffix || ''}`],
  }
}

function resolveHandler(
  mappingsModule: Record<string, unknown>,
  name: string
): HandlerFunc {
  if (
    mappingsModule[name] === undefined ||
    typeof mappingsModule[name] !== 'function'
  ) {
    throw new Error(`Cannot resolve the handler ${name} in the mappings module`)
  }
  return mappingsModule[name] as HandlerFunc
}

export function parseBlockInterval(
  blockInterval: string | undefined
): BlockInterval {
  if (blockInterval === undefined) {
    return {
      from: 0,
      to: Number.MAX_SAFE_INTEGER,
    }
  }
  // accepted formats:
  //   [1,2]
  //   [,2]
  //   [2,]
  // eslint-disable-next-line no-useless-escape
  const parts = blockInterval.split(/[\[,\]]/).map((part) => part.trim())
  if (parts.length !== 4) {
    throw new Error(
      `Block interval ${blockInterval} does not match the expected format [number?, number?]`
    )
  }
  // the parts array must be in the form ["", from, to, ""]
  const from = parts[1].length > 0 ? Number.parseInt(parts[1]) : 0
  const to =
    parts[2].length > 0 ? Number.parseInt(parts[2]) : Number.MAX_SAFE_INTEGER

  return { from, to }
}
