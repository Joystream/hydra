import YAML from 'yaml'
import YamlValidator from 'yaml-validator'
import fs from 'fs'
import path from 'path'
import semver from 'semver'
import { camelCase, upperFirst, compact } from 'lodash'
import Debug from 'debug'
import { HandlerFunc } from './QueryEventProcessingPack'
import {
  parseRange,
  PROCESSOR_PACKAGE_NAME,
  resolvePackageVersion,
} from '../util/utils'

export const STORE_CLASS_NAME = 'DatabaseManager'
export const CONTEXT_CLASS_NAME = 'SubstrateEvent'
export const EVENT_SUFFIX = 'Event'
export const CALL_SUFFIX = 'Call'

const debug = Debug('hydra-processor:manifest')

const manifestValidatorOptions = {
  structure: {
    version: 'string',
    'description?': 'string',
    'repository?': 'string',
    hydraVersion: 'string',
    dataSource: {
      kind: 'string',
      chain: 'string',
    },
    entities: ['string'],
    mappings: {
      mappingsModule: 'string',
      'imports?': ['string'],
      'range?': {
        'from?': 'number',
        'to?': 'number',
      },
      'eventHandlers?': [
        {
          event: 'string',
          'handler?': 'string',
          'range?': 'string',
        },
      ],
      'extrinsicHandlers?': [
        {
          extrinsic: 'string',
          'handler?': 'string',
          'triggerEvents?': ['string'],
          'range?': 'string',
        },
      ],
      'preBlockHooks?': [
        {
          handler: 'string',
          'range?': 'string',
        },
      ],
      'postBlockHooks?': [
        {
          handler: 'string',
          'range?': 'string',
        },
      ],
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

interface HandlerInput {
  handler?: string
  range?: string
}

interface MappingsDefInput {
  mappingsModule: string
  range?: string
  imports?: string[]
  eventHandlers?: Array<{ event: string } & HandlerInput>
  extrinsicHandlers?: Array<
    { extrinsic: string; triggerEvents?: string[] } & HandlerInput
  >
  preBlockHooks?: Array<{ handler: string } & HandlerInput>
  postBlockHooks?: Array<{ handler: string } & HandlerInput>
}

export interface MappingsDef {
  mappingsModule: Record<string, unknown>
  imports: string[]
  range: BlockRange
  eventHandlers: EventHandler[]
  extrinsicHandlers: ExtrinsicHandler[]
  preBlockHooks: MappingHandler[]
  postBlockHooks: MappingHandler[]
}

// inclusive
export interface BlockRange {
  from: number
  to: number
}

export interface MappingHandler {
  range?: BlockRange
  handler: HandlerFunc
  types: string[]
}

export interface EventHandler extends MappingHandler {
  event: string
}

export interface ExtrinsicHandler extends MappingHandler {
  extrinsic: string
  triggerEvents: string[]
}

export function hasExtrinsic(
  handler: unknown
): handler is { extrinsic: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any).extrinsic !== undefined
}

export function hasEvent(handler: unknown): handler is { event: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any).event !== undefined
}

export interface ProcessorManifest {
  version: string
  hydraVersion: string
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
    hydraVersion: string
    description?: string
    repository?: string
    dataSource: DataSource
    mappings: MappingsDefInput
  }

  const { mappings, entities, hydraVersion } = parsed
  validateHydraVersion(hydraVersion)
  validate(mappings)

  return {
    ...parsed,
    entities: entities.map((e) => path.resolve(e.trim())),
    mappings: buildMappingsDef(mappings),
  }
}

function validate(parsed: MappingsDefInput): void {
  if (
    parsed.eventHandlers === undefined &&
    parsed.extrinsicHandlers === undefined
  ) {
    throw new Error(`At least one event or extrinsic handler must be defined`)
  }
}

function validateHydraVersion(hydraVersion: string) {
  const oursHydraVersion = resolvePackageVersion(PROCESSOR_PACKAGE_NAME)
  if (
    !semver.satisfies(oursHydraVersion, hydraVersion, {
      loose: true,
      includePrerelease: true,
    })
  ) {
    throw new Error(`The processor version ${oursHydraVersion} does \\
not satisfy the required manifest version ${hydraVersion}`)
  }
}

function buildMappingsDef(parsed: MappingsDefInput): MappingsDef {
  debug(`Parsed mappings def: ${JSON.stringify(parsed, null, 2)}`)
  const {
    mappingsModule,
    range,
    eventHandlers,
    extrinsicHandlers,
    preBlockHooks,
    postBlockHooks,
    imports,
  } = parsed

  if (mappingsModule === undefined) {
    throw new Error(`Cannot resolve mappings module ${mappingsModule}`)
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const resolvedModule = require(path.resolve(mappingsModule)) as Record<
    string,
    unknown
  >

  const parseHandler = function (
    def: (
      | {
          event: string
        }
      | { extrinsic: string }
      | { handler: string }
    ) &
      HandlerInput
  ): MappingHandler {
    const { handler, range } = def
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = handler
      ? extractName(handler)
      : defaultHandlerName(def as { event: string } | { extrinsic: string })

    return {
      ...def,
      range: parseRange(range),
      handler: resolveHandler(resolvedModule, name),
      types: extractTypes(handler),
    }
  }

  return {
    mappingsModule: resolvedModule,
    imports: [mappingsModule, ...(imports || [])].map((p) => path.resolve(p)),
    range: parseRange(range),
    eventHandlers: eventHandlers
      ? eventHandlers.map((item) => parseHandler(item) as EventHandler)
      : [],
    extrinsicHandlers: extrinsicHandlers
      ? extrinsicHandlers.map(
          (item) =>
            ({
              triggerEvents: item.triggerEvents || ['system.ExtrinsicSuccess'],
              ...parseHandler(item),
            } as ExtrinsicHandler)
        )
      : [],
    preBlockHooks: preBlockHooks
      ? preBlockHooks.map((name) => parseHandler(name))
      : [],
    postBlockHooks: postBlockHooks
      ? postBlockHooks.map((name) => parseHandler(name))
      : [],
  }
}

export function extractTypes(handler: string | undefined): string[] {
  if (handler === undefined) {
    return []
  }
  if (!handler.match(/\w+(\(\s*(([\w.]+(,\s*[\w.]+\s*)*))?\))?$/)) {
    throw new Error(`Malformed handler signature: ${handler}`)
  }

  const split = compact(handler.split(/[()]/))

  if (split.length === 1) {
    // it was of the form handlerName()
    return []
  }

  if (split.length !== 2) {
    throw new Error(`Cannot parse types from ${handler}`)
  }
  return compact(split[1].split(',')).map((s) => s.trim())
}

export function extractName(handler: string): string {
  if (handler.includes('(')) {
    return handler.split('(')[0]
  }
  return handler
}

export function defaultHandlerName(
  eventOrExtrinsic: { event: string } | { extrinsic: string }
): string {
  const input = hasExtrinsic(eventOrExtrinsic)
    ? eventOrExtrinsic.extrinsic
    : eventOrExtrinsic.event
  const suffix = hasExtrinsic(eventOrExtrinsic) ? CALL_SUFFIX : '' // no suffix for events
  const [module, name] = input.split('.').map((s) => s.trim())
  // module name camelcased, name pascalcased
  return `${camelCase(module)}_${upperFirst(camelCase(name))}${suffix}`
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
