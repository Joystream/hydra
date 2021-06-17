import { ObjectType, WarthogModel } from '../model'
import { ModelType } from '../model/WarthogModel'

/**
 * Validate json type fields
 * @param jsonObjType: ObjectType
 */
export function jsonField(jsonObjTypes: ObjectType[]): void {
  const _filter = [ModelType.SCALAR, ModelType.JSON]

  jsonObjTypes.forEach((jsonObjType) => {
    jsonObjType.fields.forEach(({ modelType, directives, name }) => {
      if (!_filter.includes(modelType)) {
        throw Error(
          `"${jsonObjType.name}" should have members with scalar or json types. Fix the "${name}" field type!`
        )
      }
      if (directives.length) {
        throw Error(
          `A Json type members can not have any directive. Remove [${directives.join(
            ','
          )}] directives(s) from the "${name}" field!`
        )
      }
    })
  })
}

/**
 * Validate variant type fields
 * @param variantType: ObjectType
 */
export function variantType(variantType: ObjectType): void {
  variantType.fields.forEach((f) => {
    if (f.isRelationType()) {
      throw Error(`Reference types are not supported in varaints`)
    }
  })
}

/**
 * Validate fields with derivedField directive
 * @param model: WarthogModel
 */
export function derivedFields(model: WarthogModel): void {
  model.entities.forEach((objType) => {
    objType.fields.forEach((f) => {
      if (!f.derivedFrom) return

      if (f.isScalar()) {
        throw new Error('Derived field must be entity type!')
      }
      if (!model.lookupField(f.type, f.derivedFrom?.argument)) {
        throw new Error('Derived field does not exists on the related type')
      }
    })
  })
}
