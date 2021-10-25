import * as codecClasses from '@polkadot/types/codec'
import * as extrinsicClasses from '@polkadot/types/extrinsic'
import * as genericClasses from '@polkadot/types/generic'
import * as primitiveClasses from '@polkadot/types/primitive'
import * as interfaceDefinitions from '@polkadot/types/interfaces/definitions'
import { getReferencedNames } from './reflect'

const native = new Set([
  ...Object.keys(primitiveClasses),
  'Json',
  'Raw',
  ...Object.keys(codecClasses),
  ...Object.keys(genericClasses),
  ...Object.keys(extrinsicClasses),
])

const interfaces = new Set(
  Object.entries(interfaceDefinitions).flatMap((e) => Object.keys(e[1].types))
)

export class Imports {
  private common = new Set<string>()
  private lib = new Set<string>()
  private interfaces = new Set<string>()
  private native = new Set<string>()

  constructor(private customTypes?: { json: any; lib: string }) {}

  useSubstrateEvent(): void {
    this.common.add('SubstrateEvent')
  }

  useSubstrateExtrinsic(): void {
    this.common.add('SubstrateExtrinsic')
  }

  use(type: string): void {
    getReferencedNames(type).forEach((name) => this._use(name))
  }

  private _use(name: string): void {
    if (this.customTypes?.json[name] != null) {
      this.lib.add(name)
    } else if (interfaces.has(name)) {
      this.interfaces.add(name)
    } else if (native.has(name)) {
      this.native.add(name)
    } else {
      throw new Error(`Cannot resolve import for type ${name}`)
    }
  }

  isKnown(name: string): boolean {
    return (
      this.customTypes?.json[name] != null ||
      interfaces.has(name) ||
      native.has(name)
    )
  }

  render(): string[] {
    const lines: string[] = []
    if (this.interfaces.size > 0) {
      render(lines, '@polkadot/types/interfaces', this.interfaces)
    }
    if (this.native.size > 0) {
      render(lines, '@polkadot/types', this.native)
    }
    if (this.common.size > 0) {
      render(lines, '@subsquid/hydra-common', this.common)
    }
    if (this.lib.size > 0) {
      render(lines, this.customTypes!.lib, this.lib)
    }
    return lines
  }
}

function render(lines: string[], module: string, imports: Set<string>): void {
  lines.push(
    `import {${Array.from(imports).sort().join(', ')}} from '${module}'`
  )
}
