import Handlebars from 'handlebars'
import { ImportsDef } from './types'
import { kebabCase, countBy, last, camelCase, upperFirst } from 'lodash'
import { Arg } from '../metadata'
import { warn } from '../log'

const debug = require('debug')('hydra-typegen:helpers')

const callArgValueGetter = (ctxIndex: number) =>
  `[this.extrinsic.args[${ctxIndex}].value]`

const eventParamValueGetter = (ctxIndex: number) =>
  `[this.ctx.params[${ctxIndex}].value]`

export function renderImports(imports: ImportsDef): string {
  const defs = Object.keys(imports).map((loc: string) => ({
    file: loc,
    types: Object.keys(imports[loc]),
  }))

  debug(`Defs: ${JSON.stringify(defs, null, 2)}`)

  return defs.reduce((result, { file, types }): string => {
    const typeImport =
      types && types.length
        ? `import { ${types.sort().join(', ')} } from '${file}';\n`
        : ''
    return `${result}${typeImport}`
  }, '')
}

export function renderNamedArgs(
  args: Arg[],
  ctxValueGetter: (ctxIndex: number) => string
): string {
  debug(`Rendering named args: ${JSON.stringify(args, null, 2)}`)
  return args.reduce((result, arg: Arg, index) => {
    const type = arg.type.toString()
    const name = camelCase(arg.name.toString())
    const getStmt =
      // prettier-ignore
      `get ${name}(): ${type} {
          return ${renderCreateTypeStmt(type, ctxValueGetter(index))}
       }`

    return `${result}\n${getStmt}\n`
  }, '')
}

export function renderTypedParams(argTypes: string[]) {
  const returnType = `[${argTypes.join(',')}]`
  const returnObjects = argTypes.map((argType, index) =>
    renderCreateTypeStmt(argType, eventParamValueGetter(index))
  )
  return `get params(): ${returnType} {
    return [${returnObjects.join(',')}]
  }`
}

function renderCreateTypeStmt(argType: string, ctxValueGetter: string) {
  return `createTypeUnsafe<${argType} & Codec>(
            typeRegistry, '${argType}', ${ctxValueGetter}) `
}

export const helper: Handlebars.HelperDeclareSpec = {
  imports() {
    const { imports } = (this as unknown) as { imports: ImportsDef }
    return renderImports(imports)
  },

  kebabCase(s: string) {
    return kebabCase(s)
  },

  camelCase(s: string) {
    return camelCase(s)
  },

  pascalCase(s: string) {
    return upperFirst(camelCase(s))
  },

  toString(s: any) {
    if (s.toString !== undefined) {
      return s.toString()
    }
    return JSON.stringify(s)
  },

  paramsReturnType() {
    const { args } = (this as unknown) as { args: string[] }
    return `[${args.join(',')}]`
  },

  paramsReturnStmt() {
    const { args } = (this as unknown) as { args: string[] }
    const returnObjects = args.map((argType, index) =>
      renderCreateTypeStmt(argType, eventParamValueGetter(index))
    )
    return `return [${returnObjects.join(',\n')}]`
  },

  paramGetter() {
    const { args } = (this as unknown) as { args: string[] }
    return renderTypedParams(args)
  },

  namedGetters() {
    const { args } = (this as unknown) as { args: Arg[] }
    return renderNamedArgs(args, callArgValueGetter)
  },
}

export const handlebars = Handlebars.create()
handlebars.registerHelper(helper)
