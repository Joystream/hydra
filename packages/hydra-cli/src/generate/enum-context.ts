import { GraphQLEnumType } from 'graphql'
import { GeneratorContext, ENUMS_FOLDER } from './SourcesGenerator'
import { withNames } from './utils'

export function withEnum(enumType: GraphQLEnumType): GeneratorContext {
  return {
    ...withNames(enumType),
    ...withValues(enumType),
  }
}

export function withValues(enumType: GraphQLEnumType): GeneratorContext {
  const values: GeneratorContext[] = []
  enumType
    .getValues()
    .map((v) => values.push({ name: v.name, value: v.value as string }))
  return {
    values,
  }
}

export function withRelativePathForEnum(): GeneratorContext {
  return {
    relativePath: `../${ENUMS_FOLDER}/enums`,
  }
}
