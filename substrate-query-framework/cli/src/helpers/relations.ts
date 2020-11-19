import { EntityRelationship, Field, makeRelation, ObjectType } from '../model'
import { generateJoinColumnName, generateJoinTableName } from '../generate/utils'

function addMany2Many(rel: EntityRelationship): void {
  const { field, relatedField, entityName, relatedEntityName } = rel
  rel.field.relation = makeRelation('mtm', field.type, relatedField.name, field.nullable)

  rel.field.relation.joinTable = {
    tableName: generateJoinTableName(entityName, relatedEntityName),
    joinColumn: generateJoinColumnName(entityName),
    inverseJoinColumn: generateJoinColumnName(relatedEntityName),
  }
  rel.relatedField.relation = makeRelation('mtm', relatedField.type, field.name, relatedField.nullable)
}

function addOne2Many(rel: EntityRelationship): void {
  const { field, relatedField } = rel

  rel.field.relation = makeRelation('mto', field.type, relatedField.name, field.nullable)
  rel.relatedField.relation = makeRelation('otm', relatedField.type, field.name, relatedField.nullable)
}

function addOne2One(rel: EntityRelationship): void {
  const { field, relatedField } = rel

  rel.field.relation = makeRelation('oto', field.type, relatedField.name, field.nullable)
  rel.relatedField.relation = makeRelation('oto', relatedField.type, field.name, relatedField.nullable)

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
  const f = new Field(entity.name.toLowerCase() + field.name, entity.name, true, false, true)
  f.description = 'Addtional field required to build OneToMany relationship'
  return f
}

export const relations = {
  addMany2Many,
  addOne2Many,
  addOne2One,
  createAdditionalField,
}
