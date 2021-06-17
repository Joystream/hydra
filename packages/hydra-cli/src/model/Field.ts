import { Relation } from '.'
import { availableTypes } from '../schema/scalars'
import { ModelType } from './WarthogModel'

/**
 * Reperenst GraphQL object type field
 * @constructor(name: string, type: string, nullable: boolean = true, isBuildinType: boolean = true, isList = false)
 */
export class Field {
  // GraphQL field name
  name: string
  // GraphQL field type
  type: string
  // type in the model (SCALAR, ENUM, INTERFACE, ENTITY, VARIANT)
  modelType!: ModelType
  // Is field type built-in or not
  isBuildinType: boolean
  // Is field nullable or not
  nullable: boolean
  // Is field a list. eg: post: [Post]
  isList: boolean
  // Description of the field will be shown in GrapqQL API
  description?: string
  // Make field as a unique column on database
  unique?: boolean

  // Relation
  relation?: Relation

  derivedFrom?: {
    argument: string
  }

  apiOnly?: boolean

  directives!: string[]

  constructor(
    name: string,
    type: string,
    nullable = true,
    isBuildinType = true,
    isList = false,
    directives: string[] = []
  ) {
    this.name = name
    this.type = type
    this.nullable = nullable
    this.isBuildinType = isBuildinType
    this.isList = isList
    this.directives = directives
  }

  columnType(): string {
    if (this.relation) return this.relation?.type
    return this.isBuildinType ? availableTypes[this.type] : this.type
  }

  isArray(): boolean {
    return this.isBuildinType && this.isList
  }

  isScalar(): boolean {
    return this.isBuildinType
  }

  isRelationType(): boolean {
    return !!this.relation
  }

  isEnum(): boolean {
    return this.modelType === ModelType.ENUM
  }

  isUnion(): boolean {
    return this.modelType === ModelType.UNION
  }

  isEntity(): boolean {
    return this.modelType === ModelType.ENTITY
  }

  isJson(): boolean {
    return this.modelType === ModelType.JSON
  }
}
