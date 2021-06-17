import { GeneratorContext } from './SourcesGenerator'
import { Field, ObjectType } from '../model'
import * as util from './utils'
import { withRelativePathForEnum } from './enum-context'

import { TYPE_FIELDS, GRAPHQL_DATA_TYPES } from './constants'

export function buildFieldContext(
  f: Field,
  entity: ObjectType
): GeneratorContext {
  return {
    ...withFieldTypeGuardProps(f),
    ...withRelation(f),
    ...withArrayCustomFieldConfig(f),
    ...withTsTypeAndDecorator(f),
    ...withDerivedNames(f, entity),
    ...withTransformer(f),
    ...withDecoratorOptions(f),
  }
}

export function withDecoratorOptions(f: Field): GeneratorContext {
  return {
    required: !f.nullable,
    description: f.description,
    unique: f.unique,
    array: f.isList,
    apiOnly: f.apiOnly,
  }
}

export function withFieldTypeGuardProps(f: Field): GeneratorContext {
  const is: GeneratorContext = {}
  is.array = f.isArray()
  is.scalar = f.isScalar()
  is.enum = f.isEnum()
  is.union = f.isUnion()
  is.entity = f.isEntity()
  is.json = f.isJson()
  ;['mto', 'oto', 'otm', 'mtm'].map(
    (s) => (is[s] = f.relation && f.relation.type === s)
  )

  return {
    is: is,
  }
}

export function withTsTypeAndDecorator(f: Field): GeneratorContext {
  const fieldType = f.columnType()
  if (TYPE_FIELDS[fieldType]) {
    return {
      ...TYPE_FIELDS[fieldType],
    }
  }

  return {
    tsType: f.type,
  }
}

export function withArrayCustomFieldConfig(f: Field): GeneratorContext {
  if (!f.isArray()) {
    return {}
  }
  const type = f.columnType()
  const apiType = GRAPHQL_DATA_TYPES[type]

  let dbType = apiType
  if (dbType === 'string') {
    dbType = 'text' // postgres doesnt have 'string'
  } else if (dbType === 'float') {
    dbType = 'decimal' // postgres doesnt have 'float'
  }

  return {
    dbType,
    apiType,
  }
}

export function withDerivedNames(
  f: Field,
  entity: ObjectType
): GeneratorContext {
  return {
    ...util.names(f.name),
    relFieldName: util.camelCase(entity.name),
    relFieldNamePlural: util.camelPlural(entity.name),
    entityName: entity.name,
  }
}

export function withImport(f: Field): GeneratorContext {
  if (!f.isEnum()) {
    return {}
  }
  return {
    className: f.type,
    ...withRelativePathForEnum(),
  }
}

export function withRelation(f: Field): GeneratorContext {
  return {
    relation: f.relation,
  }
}

export function withTransformer(f: Field): GeneratorContext {
  if (
    TYPE_FIELDS[f.columnType()] &&
    TYPE_FIELDS[f.columnType()].tsType === 'BN'
  ) {
    return {
      transformer: `{
        to: (entityValue: BN) => (entityValue !== undefined) ? entityValue.toString(10) : null,
        from: (dbValue: string) => dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10): undefined,
      }`,
    }
  }
  return {}
}
