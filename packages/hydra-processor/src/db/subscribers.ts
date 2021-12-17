import {
  EntitySubscriberInterface,
  EntityMetadata,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'

type Entity = Record<string, unknown>

/*
  Event subscriber that hooks before DB insert and update events and sanitizes data.
*/
@EventSubscriber()
export class SanitizationSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<Entity>) {
    sanitizeEntity(event.entity, event.metadata)
  }

  beforeUpdate(event: UpdateEvent<Entity>) {
    if (!event.entity) {
      return
    }

    sanitizeEntity(event.entity, event.metadata)
  }
}

/*
  Sanitizes values of entity properties and makes them fit for DB saving.
*/
function sanitizeEntity(entity: Entity, entityMetadata: EntityMetadata) {
  // retrieve list of fields that might need sanitization
  const stringFields = getEntityStringFields(entityMetadata)

  // sanitize all fields that can possibly need it
  for (const field of stringFields) {
    // prevents error when saving to UTF-8 null character(s) to PostgreSQL
    sanitizeNullCharacter(entity as Record<string, string>, field)
  }
}

/*
  Replaces string made of only UTF-8 null characters by an empty string.
*/
function sanitizeNullCharacter(entity: Record<string, string>, field: string) {
  if (!entity || !entity[field] || !entity[field].match(/\u0000/)) {
    return
  }

  entity[field] = entity[field].replace(/\u0000/g, '')
}

// cache for list of entity string fields
const entityStringFieldsCache: Record<string, string[]> = {}

/*
  Get a list of Entity columns that are string.
*/
function getEntityStringFields(entityMetadata: EntityMetadata): string[] {
  if (entityMetadata.name in entityStringFieldsCache) {
    return entityStringFieldsCache[entityMetadata.name]
  }

  const fields = entityMetadata.columns.reduce((acc, item) => {
    if (
      item.type === String ||
      (typeof item.type === 'string' && item.type.includes('string'))
    ) {
      acc.push(item.propertyName)
    }

    return acc
  }, [] as string[])

  // cache result
  entityStringFieldsCache[entityMetadata.name] = fields

  return fields
}
