import Handlebars from 'handlebars'
import { ImportsDef } from './types'
import { kebabCase, countBy, last, camelCase, upperFirst } from 'lodash'
import { Arg } from '../metadata'
import { warn } from '../log'

const debug = require('debug')('hydra-typegen:helpers')

export const handlebars = Handlebars.create()

const callArgValueGetter = (ctxIndex: number) =>
  `[this.extrinsic.args[${ctxIndex}].value]`

const eventParamValueGetter = (ctxIndex: number) =>
  `[this.ctx.params[${ctxIndex}].value]`

handlebars.registerHelper({
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

  getters() {
    const { args } = (this as unknown) as { args: string[] | Arg[] }
    return isNamedArgs(args)
      ? renderNamedArgs(args, callArgValueGetter)
      : renderTypeOnlyArgs(args, eventParamValueGetter)
  },
})

function isNamedArgs(args: string[] | Arg[]): args is Arg[] {
  if (args.length === 0) {
    warn(`WARNING: empty arguments list`)
    return true
  }
  return 'name' in (args[0] as any)
}

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

export function renderTypeOnlyArgs(
  argTypes: string[],
  ctxValueGetter: (ctxIndex: number) => string
): string {
  debug(`Rendering type only args: ${JSON.stringify(argTypes, null, 2)}`)

  const grouped = countBy(argTypes)
  const typeToIndices: Record<string, number[]> = {}

  argTypes.forEach((a, i) => {
    if (typeToIndices[a]) {
      typeToIndices[a].push(i)
    } else {
      typeToIndices[a] = [i]
    }
  })

  return argTypes.reduce((result, argType: string, index) => {
    let getStmt = ''

    if (grouped[argType] === 1) {
      getStmt = `get ${nameFromType(argType)}(): ${argType} {
        return ${renderCreateTypeStmt(argType, ctxValueGetter(index))}
      }`
      // once we at the last index of that type
    } else if (index === last(typeToIndices[argType])) {
      getStmt =
        // prettier-ignore
        `get ${nameFromType(argType)}s(): { [key: number]: ${argType} } {
          return {
            ${renderCreateTypesArray(argType, typeToIndices[argType], ctxValueGetter)}
          }
        }`
    }
    return `${result}\n${getStmt}\n`
  }, '')
}

function renderCreateTypesArray(
  argType: string,
  indices: number[],
  ctxValueGetter: (ctxIndex: number) => string
) {
  return indices.reduce(
    (result, argIndex, i) =>
      `${result}${i}: ${renderCreateTypeStmt(
        argType,
        ctxValueGetter(argIndex)
      )},\n`,
    ''
  )
}

function renderCreateTypeStmt(argType: string, ctxValueGetter: string) {
  return `createTypeUnsafe<${argType} & Codec>(
            typeRegistry, '${argType}', ${ctxValueGetter}) `
}

export function inferName(arg: string | Arg): string {
  if (typeof arg === 'string') {
    return nameFromType(arg)
  }

  if (arg.name !== undefined) {
    return arg.name.toString()
  }

  return nameFromType(arg.type.toRawType())
}

export function nameFromType(rawType: string): string {
  let stripped = rawType.trim()
  if (stripped.includes('&')) {
    // if its a union type, take only the first part as it's
    // probably most descriptive
    stripped = stripped.split('&')[0].trim()
  }
  const match = /[^<]*<([^>]+)>.*/g.exec(stripped)
  if (match && match[1]) {
    stripped = match[1]
  }
  return camelCase(stripped)
}
