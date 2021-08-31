import { ObjectType, WarthogModel, FieldResolver } from '../model'
import Debug from 'debug'
import { GeneratorContext } from './SourcesGenerator'
import { buildFieldContext } from './field-context'
import * as utils from './utils'
import { GraphQLEnumType } from 'graphql'
import { AbstractRenderer } from './AbstractRenderer'
import { withEnum } from './enum-context'
import { camelCase, snakeCase } from 'lodash'
import { getRelationType } from '../model/Relation'

const debug = Debug('qnode-cli:model-renderer')

export class ModelRenderer extends AbstractRenderer {
  private objType: ObjectType

  constructor(
    model: WarthogModel,
    objType: ObjectType,
    context: GeneratorContext = {}
  ) {
    super(model, context)
    this.objType = objType
  }

  withInterfaceProp(): GeneratorContext {
    return {
      isInterface: this.objType.isInterface,
    }
  }

  withInterfaces(): GeneratorContext {
    if (
      utils.hasInterfaces(this.objType) &&
      this.objType.interfaces !== undefined
    ) {
      return {
        interfaces: [utils.withNames(this.objType.interfaces[0])],
      }
    }
    return {}
  }

  withSubclasses(): GeneratorContext {
    if (this.objType.isInterface !== true) {
      return {}
    }
    const subclasses: GeneratorContext[] = []
    this.model
      .getSubclasses(this.objType.name)
      .map((o) => subclasses.push(utils.withNames(o)))
    return {
      subclasses,
    }
  }

  withInterfaceRelationOptions(): GeneratorContext {
    if (this.objType.isInterface !== true) {
      return {}
    }
    return {
      interfaceRelations: utils.interfaceRelations(this.objType),
      interfaceEnumName: `${this.objType.name}TypeOptions`,
    }
  }

  withEnums(): GeneratorContext {
    // we need to have a state to render exports only once
    const referncedEnums = new Set<GraphQLEnumType>()
    this.objType.fields.map((f) => {
      if (f.isEnum()) referncedEnums.add(this.model.lookupEnum(f.type))
    })
    const enums: GeneratorContext[] = []
    for (const e of referncedEnums) {
      enums.push(withEnum(e))
    }
    return {
      enums,
    }
  }

  withFields(): GeneratorContext {
    const fields: GeneratorContext[] = this.objType.fields.map((f) =>
      buildFieldContext(f, this.objType)
    )

    return {
      fields,
    }
  }

  withDescription(): GeneratorContext {
    return {
      description: this.objType.description || undefined,
    }
  }

  withHasProps(): GeneratorContext {
    const has: GeneratorContext = {}
    for (const field of this.objType.fields) {
      let ct = field.columnType()
      if (ct === 'numeric' || ct === 'decimal') ct = 'numeric'
      has[ct] = true
    }
    has.array = this.objType.fields.some((f) => f.isArray())
    has.enum = this.objType.fields.some((f) => f.isEnum())
    has.union = this.objType.fields.some((f) => f.isUnion())

    debug(`ObjectType has: ${JSON.stringify(has, null, 2)}`)

    return {
      has,
    }
  }

  withImportProps(): GeneratorContext {
    const relatedEntityImports: Set<string> = new Set()
    const variantImports = new Set<string>()

    this.objType.fields.forEach((f) => {
      if (f.isUnion()) {
        variantImports.add(
          `import { ${f.type} } from '../variants/variants.model';\n`
        )
      }
      if (f.relation) {
        const { columnType } = f.relation
        // Check if it is not a self reference so we don't add the object to import list
        if (columnType !== this.objType.name) {
          relatedEntityImports.add(utils.generateEntityImport(columnType))
        }
      }
    })
    return {
      relatedEntityImports: Array.from(relatedEntityImports.values()),
      variantImports: Array.from(variantImports),
    }
  }

  withFieldResolvers(): GeneratorContext {
    const fieldResolvers: FieldResolver[] = []
    const fieldResolverImports: Set<string> = new Set()
    const entityName = this.objType.name

    for (const f of this.objType.fields) {
      if (!f.relation) continue
      const returnTypeFunc = f.relation.columnType

      fieldResolvers.push({
        returnTypeFunc,
        rootArgType: entityName,
        fieldName: f.name,
        fieldNameColumnName: snakeCase(f.name),
        rootArgName: 'r', // disable utils.camelCase(entityName) could be a reverved ts/js keyword ie `class`
        returnType: utils.generateResolverReturnType(returnTypeFunc, f.isList),
        relatedTsProp: f.relation.relatedTsProp,
        relationType: getRelationType(f.relation),
        tableName: returnTypeFunc.toLowerCase(),
      })
      if (f.type !== this.objType.name) {
        fieldResolverImports.add(utils.generateEntityImport(returnTypeFunc))
        fieldResolverImports.add(
          utils.generateEntityServiceImport(returnTypeFunc)
        )
      }
    }
    const imports = Array.from(fieldResolverImports.values())
    // If there is at least one field resolver then add typeorm to imports
    if (imports.length) {
      imports.push(
        `import { getConnection, getRepository, In, Not } from 'typeorm';
        import _ from 'lodash';
        `
      )
    }

    return {
      fieldResolvers,
      fieldResolverImports: imports,
      crossFilters: !!fieldResolvers.length,
    }
  }

  /**
   * Provides variant names for the fields that have union type, we need variant names for the union
   * in order to fetch the data for variant relations and it is used by service.mst template
   * @returns GeneratorContext
   */
  withVariantNames(): GeneratorContext {
    const variantNames = new Set<string>()
    const fieldVariantMap: { field: string; type: string }[] = []

    for (const field of this.objType.fields.filter((f) => f.isUnion())) {
      const union = this.model.lookupUnion(field.type)

      for (const type of union.types) {
        type.fields.forEach((f) => {
          if (f.isEntity()) {
            variantNames.add(type.name)
            fieldVariantMap.push({ field: camelCase(f.name), type: type.name })
          }
        })
      }
    }
    return { variantNames: Array.from(variantNames), fieldVariantMap }
  }

  transform(): GeneratorContext {
    const ctx = {
      ...this.context, // this.getGeneratedFolderRelativePath(objType.name),
      ...this.withFields(),
      ...this.withEnums(),
      ...this.withInterfaces(),
      ...this.withInterfaceProp(),
      ...this.withHasProps(),
      ...this.withSubclasses(),
      ...this.withDescription(),
      ...this.withImportProps(),
      ...this.withFieldResolvers(),
      ...utils.withNames(this.objType),
      ...this.withVariantNames(),
      ...this.withInterfaceRelationOptions(),
    }
    ctx.hasVariantNames = (ctx as any).variantNames.length > 0
    return ctx
  }
}
