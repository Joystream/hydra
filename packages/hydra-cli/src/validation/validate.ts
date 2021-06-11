import { ObjectType } from '../model'

export function jsonFieldTypes(jsonObjTypes: ObjectType[]): void {
  console.log(jsonObjTypes)
  jsonObjTypes.forEach((objType) => {
    const fields = objType.fields.filter(
      (field) => !field.isScalar() && !field.isJson()
    )
    if (fields.length) {
      throw Error(
        `"${objType.name}" @jsonField should have members with scalar or json types. Fix the following field(s) \n` +
          `${JSON.stringify(fields)}`
      )
    }
  })
}
