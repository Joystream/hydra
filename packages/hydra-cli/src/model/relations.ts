import {
  EntityRelationship,
  Field,
  ObjectType,
  Relation,
  RelationType,
} from '.'
import {
  generateJoinColumnName,
  generateJoinTableName,
} from '../generate/utils'

function addMany2Many(rel: EntityRelationship): void {
  const { field, relatedField, entity, relatedEntity } = rel
  rel.field.relation = makeRelation(
    RelationType.MTM,
    field.type,
    relatedField.name,
    field.nullable
  )

  rel.field.relation.joinTable = {
    tableName: generateJoinTableName(entity.name, relatedEntity.name),
    joinColumn: generateJoinColumnName(entity.name),
    inverseJoinColumn: generateJoinColumnName(relatedEntity.name),
  }
  rel.relatedField.relation = makeRelation(
    RelationType.MTM,
    relatedField.type,
    field.name,
    relatedField.nullable
  )
}

function addOne2Many(rel: EntityRelationship): void {
  const { field, relatedField } = rel

  rel.field.relation = makeRelation(
    field.derivedFrom ? RelationType.OTM : RelationType.MTO,
    field.type,
    relatedField.name,
    field.nullable
  )
  rel.relatedField.relation = makeRelation(
    relatedField.derivedFrom ? RelationType.OTM : RelationType.MTO,
    relatedField.type,
    field.name,
    relatedField.nullable
  )
}

function addOne2One(rel: EntityRelationship): void {
  const { field, relatedField } = rel

  rel.field.relation = makeRelation(
    RelationType.OTO,
    field.type,
    relatedField.name,
    field.nullable
  )
  rel.relatedField.relation = makeRelation(
    RelationType.OTO,
    relatedField.type,
    field.name,
    relatedField.nullable
  )

  // Decide to hold relationship on which side, joincolumn is the side that relation
  // will live
  if (rel.field.derivedFrom) {
    rel.relatedField.relation.joinColumn = true
  } else {
    rel.field.relation.joinColumn = true
  }
}

// Typeorm requires to have ManyToOne field on the related object if the relation is OneToMany
function createAdditionalField(entity: ObjectType, field: Field): Field {
  const f = new Field(
    entity.name.toLowerCase() + field.name,
    entity.name,
    true,
    false,
    true
  )
  f.description = 'Addtional field required to build OneToMany relationship'
  return f
}

export function makeRelation(
  type: string,
  columnType: string,
  relatedTsProp: string,
  nullable: boolean
): Relation {
  return {
    type,
    columnType,
    relatedTsProp,
    nullable,
  }
}

export const relations = {
  addMany2Many,
  addOne2Many,
  addOne2One,
  createAdditionalField,
}
