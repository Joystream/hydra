import { FieldDefinitionNode, StringValueNode } from 'graphql'
import { Field } from '../model'
import { DERIVED_FROM_DIRECTIVE } from '../schema/directives'

export function addDerivedFromIfy(
  fieldDef: FieldDefinitionNode,
  field: Field
): void {
  const d = fieldDef.directives?.find(
    (d) => d.name.value === DERIVED_FROM_DIRECTIVE
  )
  if (!d) return

  if (!d.arguments) {
    throw new Error(`@${DERIVED_FROM_DIRECTIVE} should have a field argument`)
  }

  const directiveArgs = d.arguments.find(
    (arg) => arg.name.value === 'field' && arg.value.kind === 'StringValue'
  )

  // TODO: graphql-js already throw error??
  if (!directiveArgs) {
    throw new Error(
      `@${DERIVED_FROM_DIRECTIVE} should have a single field argument with a sting value`
    )
  }

  field.derivedFrom = {
    argument: (directiveArgs.value as StringValueNode).value,
  }
}
