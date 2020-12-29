import Handlebars from 'handlebars'
import { ImportsDef } from './types'
import { kebabCase, countBy, last, camelCase, upperFirst } from 'lodash'

const debug = require('debug')('hydra-typegen:metadata')

export const handlebars = Handlebars.create()

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

  getters() {
    const { args } = (this as unknown) as { args: string[] }
    return renderArgs(args)
  },
})

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

export function renderArgs(args: string[]): string {
  const grouped = countBy(args)
  const typeToIndices: Record<string, number[]> = {}

  args.forEach((a, i) => {
    if (typeToIndices[a]) {
      typeToIndices[a].push(i)
    } else {
      typeToIndices[a] = [i]
    }
  })

  return args.reduce((result, argType, index) => {
    let getStmt = ''

    if (grouped[argType] === 1) {
      getStmt = `get ${nameFromType(argType)}(): ${argType} {
        return ${renderCreateTypeStmt(argType, index)}
      }`
      // once we at the last index of that type
    } else if (index === last(typeToIndices[argType])) {
      getStmt =
        // prettier-ignore
        `get ${nameFromType(argType)}s(): { [key: number]: ${argType} } {
          return {
            ${renderCreateTypesArray(argType, typeToIndices[argType])}
          }
        }`
    }
    return `${result}\n${getStmt}\n`
  }, '')
}

function renderCreateTypesArray(argType: string, indices: number[]) {
  return indices.reduce(
    (result, argIndex, i) =>
      `${result}${i}: ${renderCreateTypeStmt(argType, argIndex)},\n`,
    ''
  )
}

function renderCreateTypeStmt(argType: string, argIndex: number) {
  return `createTypeUnsafe<${argType} & Codec>(
            typeRegistry, '${argType}', [this.ctx.params[${argIndex}].value]) `
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
