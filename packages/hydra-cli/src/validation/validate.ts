import { ObjectType, WarthogModel } from '../model'

/**
 * Validate json type fields
 * @param jsonObjType: ObjectType
 */
export function jsonField(jsonObjType: ObjectType): void {
  const fields = jsonObjType.fields.filter(
    (field) => !field.isScalar() && !field.isJson()
  )
  if (fields.length) {
    throw Error(
      `"${jsonObjType.name}" @jsonField should have members with scalar or json types. Fix the following field(s) \n` +
        `${JSON.stringify(fields)}`
    )
  }
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
