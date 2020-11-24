import { WarthogModel, Field, ObjectType, EntityRelationship, RelationType } from '../model'

import { relations } from '../helpers/relations'

export class RelationshipGenerator {
  model: WarthogModel
  private _relationships: EntityRelationship[]
  private visited: Set<string>

  constructor(model: WarthogModel) {
    this.model = model
    this._relationships = []
    this.visited = new Set()
  }

  createRelationship(
    entity: ObjectType,
    relatedEntity: ObjectType,
    field: Field,
    relatedField: Field,
    type: RelationType
  ): void {
    const rel: EntityRelationship = {
      entityName: entity.name,
      relatedEntityName: relatedEntity.name,
      field,
      relatedField,
      type,
    }

    this._relationships.push(rel)
    this.visited.add(`${field.name}:${relatedField.name}`)
  }

  listFieldWithDerivedFromDirective(entity: ObjectType, relatedEntity: ObjectType, field: Field): boolean {
    const relatedField = relatedEntity.fields.find(f => field.derivedFrom && field.derivedFrom.argument === f.name)
    if (!relatedField) {
      throw Error(
        `Incorrect relationship detected. A field like 'someField: [${entity.name}]' must exists on ${relatedEntity.name}`
      )
    }
    if (this.visited.has(`${field.name}:${relatedField.name}`)) false

    relatedField.isList
      ? this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.MTM)
      : this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.OTM)
    return true
  }

  listFieldWithoutDerivedFromDirective(entity: ObjectType, relatedEntity: ObjectType, field: Field): boolean {
    const relatedField = relatedEntity.fields.find(
      f => f.type === entity.name && f.derivedFrom && f.derivedFrom.argument === field.name
    )
    if (relatedField === undefined) {
      throw Error(
        `Incorrect relationship detected A field like 'someField: [${entity.name}] @derivedFrom(${field.name})' must exists on ${relatedEntity.name}`
      )
    }
    if (this.visited.has(`${field.name}:${relatedField.name}`)) return false
    this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.MTM)
    return true
  }

  fieldWithDerivedFromDirective(entity: ObjectType, relatedEntity: ObjectType, field: Field): boolean {
    const relatedField = relatedEntity.fields.find(
      f => f.type === entity.name && f.name === field.derivedFrom?.argument && !field.isList && !f.derivedFrom
    )
    if (relatedField === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const arg = field.derivedFrom!.argument
      throw Error(
        `Incorrect relationship! A field like 'someField: ${entity.name} @derivedFrom("${arg}")' should exists on ${relatedEntity.name}`
      )
    }
    if (this.visited.has(`${field.name}:${relatedField.name}`)) return false
    this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.OTO)
    return true
  }

  fieldWithoutDerivedFromDirective(entity: ObjectType, relatedEntity: ObjectType, field: Field): boolean {
    // Get all the related fields
    const relatedFields = relatedEntity.fields.filter(f => f.type === entity.name)
    // No fields found build OneToMany relationship
    if (relatedFields.length === 0) {
      const relatedField = relations.createAdditionalField(entity, field)
      if (this.visited.has(`${field.name}:${relatedField.name}`)) return false
      this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.OTM)
      return true
    }

    const relatedField = relatedFields.find(f => f.derivedFrom !== undefined && f.derivedFrom?.argument === field.name)
    if (relatedField === undefined) {
      const relatedField = relations.createAdditionalField(entity, field)
      if (this.visited.has(`${field.name}:${relatedField.name}`)) return false
      this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.OTM)
      return true
    }

    if (this.visited.has(`${field.name}:${relatedField.name}`)) return false
    relatedField.isList
      ? this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.OTM)
      : this.createRelationship(entity, relatedEntity, field, relatedField, RelationType.OTO)
    return true
  }

  // Adds 'relation' property to fields
  private _addRelationPropertyFields(): void {
    for (const rel of this._relationships) {
      switch (rel.type) {
        case 'oto':
          relations.addOne2One(rel)
          break
        case 'otm':
          relations.addOne2Many(rel)
          break
        case 'mtm':
          relations.addMany2Many(rel)
          break
        default:
          throw Error(`Unknown relation type: ${rel.type}`)
      }
    }
  }

  private _addAdditionalFieldsForOneToManyRelationship(): void {
    // Add missing fields to entities
    for (const r of this._relationships) {
      if (r.type !== 'otm') continue

      const entity = this.model.lookupEntity(r.relatedEntityName)
      const field = entity.fields.find(f => f.name === r.relatedField.name)
      if (field === undefined) entity.fields.push(r.relatedField)
    }
  }

  buildRelationships(): void {
    const entityNames = this.model.entities.map(t => t.name)

    for (const entity of this.model.entities) {
      for (const field of entity.fields) {
        // No relation continue
        if (!entityNames.includes(field.type)) continue

        const relatedEntity = this.model.lookupEntity(field.type)

        const { isList, derivedFrom } = field

        if (isList && derivedFrom === undefined) {
          if (!this.listFieldWithoutDerivedFromDirective(entity, relatedEntity, field)) continue
        }

        if (isList && derivedFrom !== undefined) {
          if (!this.listFieldWithDerivedFromDirective(entity, relatedEntity, field)) continue
        }

        if (!isList && derivedFrom === undefined) {
          if (!this.fieldWithoutDerivedFromDirective(entity, relatedEntity, field)) continue
        }

        if (!isList && derivedFrom !== undefined) {
          if (!this.fieldWithDerivedFromDirective(entity, relatedEntity, field)) continue
        }
      }
    }
  }

  generate(): void {
    this.buildRelationships()
    this._addRelationPropertyFields()
    this._addAdditionalFieldsForOneToManyRelationship()
  }
}
