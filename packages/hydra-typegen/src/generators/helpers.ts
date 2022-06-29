import Handlebars from 'handlebars'
import { ImportsDef } from './types'
import { kebabCase, camelCase, upperFirst } from 'lodash'
import { ExtractedParam, ExtractedVaraintData } from '../metadata'

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
  args: ExtractedParam[],
  ctxValueGetter: (ctxIndex: number) => string
): string {
  debug(`Rendering named args: ${JSON.stringify(args, null, 2)}`)
  return args.reduce((result, arg, index) => {
    const type = arg.type.toString()
    const name = camelCase((arg.name || index).toString())
    const getStmt =
      // prettier-ignore
      `get ${name}(): ${type} {
          return ${renderCreateTypeStmt(type, ctxValueGetter(index))}
       }`

    return `${result}\n${getStmt}\n`
  }, '')
}

function renderCreateTypeStmt(typeName: string, ctxValueGetter: string) {
  return `createTypeUnsafe(typeRegistry, '${typeName}', ${ctxValueGetter}) `
}

/**
 * Converts tuple types (X, Y, Z) to [X, Y, Z] & Codec
 */
export function convertTuples(type: string): string {
  let _type = type

  // recursively find typles and replace them
  while (_type.match(/\(([^(].*)\)/g)) {
    _type = _type.replace(/\(([^(].*)\)/, '[$1] & Codec')
  }

  return _type
}

export const helper: Handlebars.HelperDeclareSpec = {
  imports() {
    const { imports } = this as unknown as { imports: ImportsDef }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toString(s: any) {
    if (s.toString !== undefined) {
      return s.toString()
    }
    return JSON.stringify(s)
  },

  paramsReturnType() {
    const { params } = this as unknown as ExtractedVaraintData
    return `[${params.map(({ type }) => convertTuples(type)).join(',')}]`
  },

  paramsReturnStmt() {
    const { params } = this as unknown as ExtractedVaraintData
    const returnObjects = params.map(({ type }, index) =>
      renderCreateTypeStmt(type, eventParamValueGetter(index))
    )
    return `return [${returnObjects.join(',\n')}]`
  },

  namedGetters() {
    const { params } = this as unknown as ExtractedVaraintData
    return renderNamedArgs(params, callArgValueGetter)
  },
}

export const handlebars = Handlebars.create()
handlebars.registerHelper(helper)
