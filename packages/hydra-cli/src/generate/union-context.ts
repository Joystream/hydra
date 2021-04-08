import { GeneratorContext, VARIANTS_FOLDER } from './SourcesGenerator'
import { UnionType } from '../model/WarthogModel'
import { withNames } from './utils'

export function withUnionType(unionType: UnionType): GeneratorContext {
  return {
    ...withNames(unionType),
    ...withTypes(unionType),
  }
}

export function withTypes(unionType: UnionType): GeneratorContext {
  const types: GeneratorContext[] = []
  unionType.types.map((t) => types.push(withNames(t)))
  return {
    types,
  }
}

export function withRelativePathForUnions(): GeneratorContext {
  return {
    relativePath: `../${VARIANTS_FOLDER}/unions`,
  }
}
