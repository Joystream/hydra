import type { MetadataLatest } from '@polkadot/types/interfaces'

/**
 * Represents substrate module (pallet)
 */
export interface Module {
  name: string
  events: Event[]
  calls: Call[]
}

/**
 * Represents substrate event (within module)
 */
export interface Event {
  name: string
  /**
   * List of event argument types
   */
  args: string[]
  docs?: string[]
}

/**
 * Represents substrate call (within module)
 */
export interface Call {
  name: string
  args: CallArg[]
  docs?: string[]
}

export interface CallArg {
  name: string
  type: string
}

export function parseChainMetadata(metadata: MetadataLatest): Module[] {
  return metadata.pallets.map((pallet) => {
    const mod: Module = {
      name: pallet.name.toString(),
      events: [],
      calls: [],
    }

    if (pallet.events.isSome) {
      const events = metadata.lookup.getSiType(pallet.events.unwrap().type)
      events.def.asVariant.variants.forEach((v) => {
        const name = v.name.toString()
        const docs = v.docs.map((t) => t.toString())
        const args = v.fields.map(
          (f) => metadata.lookup.getTypeDef(f.type).type
        )
        mod.events.push({ name, args, docs })
      })
    }

    if (pallet.calls.isSome) {
      const calls = metadata.lookup.getSiType(pallet.calls.unwrap().type)
      calls.def.asVariant.variants.forEach((v) => {
        const name = v.name.toString()
        const docs = v.docs.map((t) => t.toString())
        const args = v.fields.map((f) => {
          return {
            name: f.name.unwrap().toString(),
            type: metadata.lookup.getTypeDef(f.type).type,
          }
        })
        mod.calls.push({ name, docs, args })
      })
    }

    return mod
  })
}

/**
 * Given a type expression, return a set of referenced names.
 *
 * E.g. `getReferencedNames('Account<Balance>') === new Set(['Account', 'Balance'])`
 */
export function getReferencedNames(type: string): Set<string> {
  return new Set(
    type
      .split(/[<>&|,()]/)
      .map((t) => t.trim())
      .filter((t) => !!t)
  )
}
