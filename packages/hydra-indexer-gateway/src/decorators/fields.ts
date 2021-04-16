import graphqlFields from 'graphql-fields'
import { createParamDecorator } from 'type-graphql'

// eslint-disable-next-line @typescript-eslint/naming-convention
export function TopLevelFields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(graphqlFields(info as any)).filter(
      (item) => !item.startsWith('__')
    )
  })
}
