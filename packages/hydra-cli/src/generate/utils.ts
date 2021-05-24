import _, { upperFirst, kebabCase, camelCase, snakeCase, toLower } from 'lodash'
import { GeneratorContext } from './SourcesGenerator'
import { ObjectType, Field } from '../model'
import pluralize from 'pluralize'
import { ModelType } from '../model/WarthogModel'
import { GraphQLEnumType, GraphQLEnumValueConfigMap } from 'graphql'

export { upperFirst, kebabCase, camelCase }
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function supplant(str: string, obj: Record<string, unknown>): string {
  return str.replace(/\${([^${}]*)}/g, (a, b) => {
    const r = obj[b]
    return typeof r === 'string' ? r : a
  })
}

export function pascalCase(str: string): string {
  return upperFirst(camelCase(str))
}

export function camelPlural(str: string): string {
  return camelCase(pluralize(str))
}

export function names(name: string): { [key: string]: string } {
  return {
    className: pascalCase(name),
    camelName: camelCase(name),
    kebabName: kebabCase(name),
    relClassName: pascalCase(name),
    typeormAliasName: toLower(name),
    relCamelName: camelCase(name),
    // Not proper pluralization, but good enough and easy to fix in generated code
    camelNamePlural: camelPlural(name),
  }
}

export function withNames({ name }: { name: string }): GeneratorContext {
  return {
    name,
    ...names(name),
  }
}

export function hasInterfaces(o: ObjectType): boolean {
  if (o.interfaces === undefined) {
    return false
  }
  return o.interfaces.length > 0
}

/**
 * Return fields which are not definded in the interface
 * @param o ObjecType definition
 */
export function ownFields(o: ObjectType): Field[] {
  if (!hasInterfaces(o) || o.interfaces === undefined) {
    return o.fields
  }

  const intrFields = o.interfaces[0].fields || []
  const fields = _.differenceBy(o.fields, intrFields, 'name')
  // Add non-scalar fields back to the object
  _.intersectionBy(o.fields, intrFields, 'name').forEach((f) => {
    if (!f.isBuildinType && f.relation) fields.push(f)
  })
  return fields
}

export function interfaceRelations(o: ObjectType): { fieldName: string }[] {
  return o.fields
    .filter((f) => f.isEntity())
    .map((f) => {
      return { fieldName: toLower(f.name) }
    })
}

export function generateJoinColumnName(name: string): string {
  return snakeCase(name.concat('_id'))
}

export function generateJoinTableName(table1: string, table2: string): string {
  return snakeCase(table1.concat('_', table2))
}

export function generateEntityImport(entityName: string): string {
  const kebabName = kebabCase(entityName)
  return `import {${entityName}} from '../${kebabName}/${kebabName}.model'`
}

export function generateEntityServiceImport(name: string): string {
  const kebabName = kebabCase(name)
  return `import {${name}Service} from '../${kebabName}/${kebabName}.service'`
}

export function generateResolverReturnType(
  type: string,
  isList: boolean
): string {
  return `Promise<${type}${isList ? '[]' : ''} | null>`
}

/**
 * replace all whitespaces and carriage returns
 *
 * @param s
 * @returns the same string with all whitecharacters removed
 */
export function compact(s: string): string {
  return s.replace(/\s/g, '')
}

/**
 * Generate EnumField for interface filtering; filter interface by implementers
 * e.g where: {type_in: [Type1, Type2]}
 */
export function generateEnumField(typeName: string, apiOnly = true): Field {
  const enumField = new Field(`type`, typeName)
  enumField.modelType = ModelType.ENUM
  enumField.description = 'Filtering options for interface implementers'
  enumField.isBuildinType = false
  enumField.apiOnly = apiOnly
  return enumField
}

export function generateGraphqlEnumType(
  name: string,
  values: GraphQLEnumValueConfigMap
): GraphQLEnumType {
  return new GraphQLEnumType({
    name,
    values,
  })
}

export function generateEnumOptions(
  options: string[]
): GraphQLEnumValueConfigMap {
  // const values: GraphQLEnumValueConfigMap = this._model
  //   .getSubclasses(i.name)

  return options.reduce((init, option) => {
    init[option] = { value: option }
    return init
  }, {})
}
