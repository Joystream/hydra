import { Field, ObjectType } from '.'

interface JoinTable {
  tableName: string
  joinColumn: string
  inverseJoinColumn: string
}

export interface Relation {
  // Relation type oto, otm, mtm
  type: string

  // Column type
  columnType: string

  nullable: boolean

  // Table that will hold relation id (foreign key)
  joinColumn?: boolean

  joinTable?: JoinTable

  relatedTsProp?: string
}

/**
 * Field resolver for related fields
 */
export interface FieldResolver {
  returnTypeFunc: string
  fieldName: string
  rootArgName: string
  rootArgType: string
  returnType: string
  relatedTsProp: string | undefined
  relationType: RelationTypeGuard
  tableName: string
}

export interface EntityRelationship {
  entity: ObjectType
  relatedEntity: ObjectType
  field: Field
  relatedField: Field
  type: string
}

type EntityRelatedEntityField = {
  entity: ObjectType
  relatedEntity: ObjectType
  field: Field
}

export enum RelationType {
  // OneToOne
  OTO = 'oto',

  // OneToMany
  OTM = 'otm',

  // ManyToMany
  MTM = 'mtm',

  // ManyToOne
  MTO = 'mto',
}
interface RelationTypeGuard {
  isOTO: boolean
  isOTM: boolean
  isMTO: boolean
  isMTM: boolean
  isModifier: boolean
}

export function getRelationType(r: Relation): RelationTypeGuard {
  return {
    isOTO: r.type === RelationType.OTO,
    isOTM: r.type === RelationType.OTM,
    isMTO: r.type === RelationType.MTO,
    isMTM: r.type === RelationType.MTM,
    isModifier: r.type === RelationType.OTM || r.type === RelationType.MTM,
  }
}
