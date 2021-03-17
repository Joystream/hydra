import {
  WarthogModel,
  Field,
  ObjectType,
  EntityRelationship,
  RelationType,
} from '../model'

import { relations } from '../model/relations'
import { ModelType } from '../model/WarthogModel'

type EntityRelatedEntityField = {
  entity: ObjectType
  relatedEntity: ObjectType
  field: Field
}

export class RelationshipGenerator {
  model: WarthogModel
  relationships: EntityRelationship[]
  private visited: Set<string>

  constructor(model: WarthogModel) {
    this.model = model
    this.relationships = []
    this.visited = new Set()
  }

  traversed(field: Field, relatedField: Field): boolean {
    return (
      this.visited.has(`${field.name}:${relatedField.name}`) ||
      this.visited.has(`${relatedField.name}:${field.name}`)
    )
  }

  createRelationship(rel: EntityRelationship): void {
    this.relationships.push(rel)

    const { field, relatedField } = rel
    this.visited.add(`${field.name}:${relatedField.name}`)
    // reversed
    this.visited.add(`${relatedField.name}:${field.name}`)
  }

  listFieldWithDerivedFromDirective(props: EntityRelatedEntityField): void {
    const { entity, relatedEntity, field } = props
    const relatedField = relatedEntity.fields.find(
      (f) => field.derivedFrom && field.derivedFrom.argument === f.name
    )
    if (!relatedField) {
      throw Error(
        `Incorrect relationship detected. A field like 'someField: [${entity.name}]' must exists on ${relatedEntity.name}`
      )
    }
    if (this.traversed(field, relatedField)) {
      return
    }
    const rel = {
      entity,
      relatedEntity,
      field,
      relatedField,
    }
    if (relatedField.isList) {
      this.createRelationship({ ...rel, type: RelationType.MTM })
    } else {
      this.createRelationship({ ...rel, type: RelationType.OTM })
    }
  }

  listFieldWithoutDerivedFromDirective(props: EntityRelatedEntityField): void {
    const { entity, relatedEntity, field } = props

    const relatedField = relatedEntity.fields.find(
      (f) =>
        f.type === entity.name &&
        f.derivedFrom &&
        f.derivedFrom.argument === field.name
    )
    if (!relatedField) {
      throw Error(
        `Incorrect relationship detected A field like 'someField: [${entity.name}] @derivedFrom(${field.name})' must exists on ${relatedEntity.name}`
      )
    }
    if (this.traversed(field, relatedField)) {
      return
    }
    this.createRelationship({
      ...props,
      relatedField,
      type: RelationType.MTM,
    })
  }

  fieldWithDerivedFromDirective(props: EntityRelatedEntityField): void {
    const { entity, relatedEntity, field } = props
    const relatedField = relatedEntity.fields.find(
      (f) =>
        f.type === entity.name &&
        f.name === field.derivedFrom?.argument &&
        !field.isList &&
        !f.derivedFrom
    )
    if (!relatedField) {
      throw Error(
        `Incorrect relationship! A field like 'someField: ${entity.name} @derivedFrom("${field.derivedFrom?.argument}")' should exists on ${relatedEntity.name}`
      )
    }
    if (this.traversed(field, relatedField)) {
      return
    }
    this.createRelationship({ ...props, relatedField, type: RelationType.OTO })
  }

  fieldWithoutDerivedFromDirective(props: EntityRelatedEntityField): void {
    const { entity, relatedEntity, field } = props
    // Get all the related fields
    const relatedFields = relatedEntity.fields.filter(
      (f) => f.type === entity.name
    )
    // No fields found build OneToMany relationship
    if (!relatedFields.length) {
      const relatedField = relations.createAdditionalField(entity, field)
      if (this.traversed(field, relatedField)) {
        return
      }
      this.createRelationship({
        ...props,
        relatedField,
        type: RelationType.OTM,
      })
      return
    }

    const relatedField = relatedFields.find(
      (f) => f.derivedFrom && f.derivedFrom?.argument === field.name
    )

    if (!relatedField) {
      const relatedField = relations.createAdditionalField(entity, field)
      if (this.traversed(field, relatedField)) {
        return
      }
      this.createRelationship({
        ...props,
        relatedField,
        type: RelationType.OTM,
      })
      return
    }

    if (this.traversed(field, relatedField)) {
      return
    }

    const rel = { ...props, relatedField }

    if (relatedField.isList) {
      this.createRelationship({ ...rel, type: RelationType.OTM })
    } else {
      this.createRelationship({ ...rel, type: RelationType.OTO })
    }
  }

  // Adds 'relation' property to fields
  private _addRelationPropertyFields(): void {
    for (const rel of this.relationships) {
      switch (rel.type) {
        case RelationType.OTO:
          relations.addOne2One(rel)
          break
        case RelationType.OTM:
          relations.addOne2Many(rel)
          break
        case RelationType.MTM:
          relations.addMany2Many(rel)
          break
        default:
          throw Error(`Unknown relation type: ${rel.type}`)
      }
    }

    // Add additional fields for OneToMany
    for (const r of this.relationships) {
      if (r.type === RelationType.OTM) {
        const entity = this.model.lookupEntity(r.relatedEntity.name)
        const field = entity.fields.find((f) => f.name === r.relatedField.name)
        if (!field) entity.fields.push(r.relatedField)
      }
    }
  }

  buildRelationships(): void {
    for (const entity of this.model.entities) {
      const fields = entity.fields.filter(
        (f) => f.modelType === ModelType.ENTITY
      )

      for (const field of fields) {
        const relatedEntity = this.model.lookupEntity(field.type)
        const props = { entity, relatedEntity, field }

        if (field.isList) {
          field.derivedFrom
            ? this.listFieldWithDerivedFromDirective(props)
            : this.listFieldWithoutDerivedFromDirective(props)
        } else {
          field.derivedFrom
            ? this.fieldWithDerivedFromDirective(props)
            : this.fieldWithoutDerivedFromDirective(props)
        }
      }
    }
  }

  generate(): void {
    this.buildRelationships()
    this._addRelationPropertyFields()
  }
}
