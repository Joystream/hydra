import graphqlFields from 'graphql-fields'
import { createParamDecorator } from 'type-graphql'

export function Fields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    // This object will be of the form:
    //   rawFields {
    //     baseField: {},
    //     association: { subField: "foo"}
    //   }
    // We need to pull out items with subFields
    const rawFields = graphqlFields(info as any)

    const scalars = Object.keys(rawFields).filter((item) => {
      return Object.keys(rawFields[item]).length === 0 && !item.startsWith('__')
    })

    return scalars
  })
}

export function RawFields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    return graphqlFields(info as any)
  })
}

export function TopLevelFields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    return Object.keys(graphqlFields(info as any)).filter(
      (item) => !item.startsWith('__')
    )
  })
}
