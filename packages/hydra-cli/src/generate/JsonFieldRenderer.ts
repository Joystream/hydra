import { WarthogModel } from '../model'
import { GeneratorContext } from './SourcesGenerator'
import { AbstractRenderer } from './AbstractRenderer'
import { ModelRenderer } from './ModelRenderer'

export class JsonFieldRenderer extends AbstractRenderer {
  constructor(model: WarthogModel, context: GeneratorContext = {}) {
    super(model, context)
  }

  jsonFields(): GeneratorContext {
    const jsonFields: GeneratorContext[] = []
    for (const jsonField of this.model.jsonFields) {
      const renderer = new ModelRenderer(this.model, jsonField, {})
      jsonFields.push(renderer.transform())
    }
    return {
      jsonFields,
    }
  }

  transform(): GeneratorContext {
    return {
      ...this.jsonFields(),
    }
  }
}
