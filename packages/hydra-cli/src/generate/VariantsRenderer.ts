import { WarthogModel } from '../model'
import { GeneratorContext } from './SourcesGenerator'
import { AbstractRenderer } from './AbstractRenderer'
import { ModelRenderer } from './ModelRenderer'
import { withUnionType } from './union-context'

export class VariantsRenderer extends AbstractRenderer {
  constructor(model: WarthogModel, context: GeneratorContext = {}) {
    super(model, context)
  }

  withImports(): { imports: string[] } {
    const moduleImports = new Set<string>()
    this.model.variants.forEach((v) => {
      if (v.fields.find((f) => f.type === 'BigInt')) {
        moduleImports.add(`import BN from 'bn.js'\n`)
      }
    })
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
