import { DeepPartial } from 'typeorm'
import * as shortid from 'shortid'

export function fillRequiredWarthogFields<T>(
  entity: DeepPartial<T>
): DeepPartial<T> {
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('id')) {
    Object.assign(entity, { id: shortid.generate() })
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('createdById')) {
    Object.assign(entity, { createdById: shortid.generate() })
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!entity.hasOwnProperty('version')) {
    Object.assign(entity, { version: 1 })
  }
  return entity
}
