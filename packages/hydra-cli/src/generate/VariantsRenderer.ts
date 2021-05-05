import { WarthogModel } from '../model'
import { GeneratorContext } from './SourcesGenerator'
import { AbstractRenderer } from './AbstractRenderer'
import { ModelRenderer } from './ModelRenderer'
import { withUnionType } from './union-context'
import { generateEntityImport } from './utils'

export class VariantsRenderer extends AbstractRenderer {
  constructor(model: WarthogModel, context: GeneratorContext = {}) {
    super(model, context)
  }

  withImports(): { imports: string[] } {
    const moduleImports = new Set<string>()
    for (const variant of this.model.variants) {
      variant.fields.map((f) => {
        if (f.isEntity()) {
          moduleImports.add(generateEntityImport(f.type))
        }
      })
    }
    return { imports: Array.from(moduleImports) }
  }

  withVariants(): GeneratorContext {
    const variants: GeneratorContext[] = []
    for (const v of this.model.variants) {
      const renderer = new ModelRenderer(this.model, v, {})
      variants.push(renderer.transform())
    }
    return {
      variants,
    }
  }

  withUnions(): GeneratorContext {
    const unions: GeneratorContext[] = []
    for (const u of this.model.unions) {
      unions.push(withUnionType(u))
    }
    return {
      unions,
    }
  }

  transform(): GeneratorContext {
    return {
      ...this.withUnions(),
      ...this.withVariants(),
      ...this.withImports(),
    }
  }
}
