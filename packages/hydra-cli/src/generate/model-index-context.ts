import Debug from 'debug'
import { ObjectType, WarthogModel } from '../model'
import { GeneratorContext } from './SourcesGenerator'
import { withNames } from './utils'

const debug = Debug('qnode-cli:model-index-context')

export function withModelNames(model: WarthogModel): {
  modelClasses: GeneratorContext[]
} {
  const entities = [...model.interfaces, ...model.entities]
  return {
    modelClasses: entities.map((e) => withNames(e)),
  }
}

export function withEnumNames(model: WarthogModel): {
  enums: GeneratorContext[]
} {
  return { enums: model.enums.map((en) => withNames(en)) }
}

export function withUnionNames(model: WarthogModel): {
  unions: GeneratorContext[]
} {
  return { unions: model.unions.map((u) => withNames(u)) }
}

export function withVariantNames(model: WarthogModel): {
  variants: GeneratorContext[]
} {
  return { variants: model.variants.map((v: ObjectType) => withNames(v)) }
}

export function withJsonFieldNames(model: WarthogModel): {
  jsonFields: GeneratorContext[]
} {
  return { jsonFields: model.jsonFields.map((j) => withNames(j)) }
}

export function indexContext(model: WarthogModel): GeneratorContext {
  const out = {
    ...withModelNames(model),
    ...withEnumNames(model),
    ...withUnionNames(model),
    ...withVariantNames(model),
    ...withJsonFieldNames(model),
  }
  debug(`Index context: ${JSON.stringify(out, null, 2)}`)
  return out
}
