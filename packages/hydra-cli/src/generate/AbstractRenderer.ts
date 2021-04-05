import { GeneratorContext } from './SourcesGenerator'
import { WarthogModel } from '../model'
import Mustache from 'mustache'
import Debug from 'debug'
import * as prettier from 'prettier'

const debug = Debug('qnode-cli:abstract-renderer')

export abstract class AbstractRenderer {
  protected context: GeneratorContext = {}
  protected model: WarthogModel

  constructor(model: WarthogModel, context: GeneratorContext = {}) {
    this.context = context
    this.model = model
  }

  abstract transform(): GeneratorContext

  render(mustacheTeplate: string): string {
    return render(mustacheTeplate, this.transform())
  }
}

export function render(template: string, context: GeneratorContext): string {
  debug(`Rendering with context: ${JSON.stringify(context, null, 2)}`)

  const rendered = Mustache.render(template, context)
  return prettier.format(rendered, {
    parser: 'typescript',
    singleQuote: true,
    printWidth: 120,
  })
}
