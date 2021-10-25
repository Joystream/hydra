import { Imports } from './imports'
import { warn } from './log'
import { OutDir } from './out'
import { getReferencedNames, Module } from './reflect'

export interface TypegenOptions {
  modules: Module[]
  outDir: OutDir
  events?: string[]
  calls?: string[]
  customTypes?: { json: any; lib: string }
}

export function typegen(options: TypegenOptions): void {
  const { modules, outDir: dir } = options
  const index = dir.file('index.ts')

  modules.forEach((mod) => {
    const imports = new Imports(options.customTypes)

    const events = mod.events.filter((e) => {
      const fullName = composeFullName(mod.name, e.name)
      if (!options.events?.includes(fullName)) return false
      const ok = e.args.every((arg, idx) =>
        checkArgumentType(imports, arg, `argument ${idx} of ${fullName}`)
      )
      if (ok) return ok
      warn(`Skipping event ${fullName}`)
      return false
    })

    const calls = mod.calls.filter((c) => {
      const fullName = composeFullName(mod.name, c.name)
      if (!options.calls?.includes(fullName)) return false
      const ok = c.args.every((arg) =>
        checkArgumentType(
          imports,
          arg.type,
          `argument '${arg.name}' of ${fullName}`
        )
      )
      if (ok) return ok
      warn(`Skipping call ${fullName}`)
    })

    if (events.length === 0 && calls.length === 0) return

    index.line(`export * from './${mod.name}'`)
    const out = dir.file(mod.name + '.ts')
    out.line(`import assert from 'assert'`)
    out.line(`import {create} from './_registry'`)
    out.lazy(() => imports.render())
    out.line()
    out.block(`export namespace ${mod.name}`, () => {
      events.forEach((e) => {
        imports.useSubstrateEvent()
        e.args.forEach((arg) => imports.use(arg))
        out.blockComment(e.docs)
        out.block(`export class ${e.name}Event`, () => {
          out.block('constructor(private event: SubstrateEvent)', () => {
            e.args.forEach((arg, idx) => {
              out.line(
                `assert.strictEqual(this.event.params[${idx}].type, '${arg}', 'unexpected type for param ${idx} of ${mod.name}.${e.name}')`
              )
            })
          })
          out.line()
          out.block(
            `get params(): [${e.args.map(convertTuples).join(', ')}]`,
            () => {
              out.line(
                `return [${e.args
                  .map(
                    (arg, idx) =>
                      `create('${arg}', this.event.params[${idx}].value)`
                  )
                  .join(', ')}]`
              )
            }
          )
        })
        out.line()
      })

      calls.forEach((c) => {
        imports.useSubstrateExtrinsic()
        c.args.forEach((arg) => imports.use(arg.type))
        out.blockComment(c.docs)
        out.block(`export class ${upperFirst(c.name)}Call`, () => {
          out.line(`private _extrinsic: SubstrateExtrinsic`)
          out.line()
          out.block(`constructor(extrinsic: SubstrateExtrinsic)`, () => {
            out.line(`this._extrinsic = extrinsic`)
            c.args.forEach((arg, idx) => {
              out.line(
                `assert.strictEqual('${arg.type}', this._extrinsic.args[${idx}].type)`
              )
            })
          })
          c.args.forEach((arg, idx) => {
            out.line()
            out.block(`get ${arg.name}(): ${convertTuples(arg.type)}`, () => {
              out.line(
                `return create('${arg.type}', this._extrinsic.args[${idx}].value)`
              )
            })
          })
        })
      })
    })
    out.write()
  })

  index.write()

  const reg = dir.file('_registry.ts')
  reg.line(`import {createTypeUnsafe, TypeRegistry} from '@polkadot/types'`)
  reg.line(`import {Codec, DetectCodec} from '@polkadot/types/types'`)
  reg.line()
  if (options.customTypes) {
    reg.line(
      `export const typesJson = ${JSON.stringify(
        options.customTypes.json,
        null,
        2
      )}`
    )
    reg.line()
  }
  reg.line(`export const registry = new TypeRegistry()`)
  if (options.customTypes) {
    reg.line('registry.register(typesJson)')
  }
  reg.line()
  reg.block(
    `export function create<T extends Codec = Codec, K extends string = string>(type: K, params: unknown): DetectCodec<T, K>`,
    () => {
      reg.line(`return createTypeUnsafe(registry, type, [params])`)
    }
  )
  reg.write()
}

function checkArgumentType(
  imports: Imports,
  type: string,
  of: string
): boolean {
  return Array.from(getReferencedNames(type)).every((name) => {
    if (imports.isKnown(name)) {
      return true
    } else if (name.indexOf('{') >= 0) {
      warn(`Unable to handle type of ${of}`)
      return false
    } else {
      warn(`Can't resolve type ${name} of ${of}`)
      return false
    }
  })
}

/**
 * Converts tuple types (X, Y, Z) to [X, Y, Z] & Codec
 */
function convertTuples(type: string): string {
  while (type.match(/\(([^(].*)\)/g)) {
    type = type.replace(/\(([^(].*)\)/, '[$1] & Codec')
  }
  return type
}

function composeFullName(mod: string, name: string): string {
  return mod[0].toLowerCase() + mod.slice(1) + '.' + name
}

function upperFirst(s: string): string {
  if (s) {
    return s[0].toUpperCase() + s.slice(1)
  } else {
    return s
  }
}
