import { MappingsLookupService } from './MappingsLookupService'
import { getManifest } from '../start/config'
import { IMappingExecutor } from './IMappingExecutor'
import { IMappingsLookup } from './IMappingsLookup'
import { TransactionalExecutor } from './TransactionalExecutor'

let mappingExecutor: TransactionalExecutor
let mappingsLookup: MappingsLookupService

export * from './IMappingExecutor'
export * from './IMappingsLookup'
export * from './tx-aware'
export { generateNextId } from './EntityIdGenerator' // expose for external usage

export async function getMappingExecutor(): Promise<IMappingExecutor> {
  if (!mappingExecutor) {
    mappingExecutor = new TransactionalExecutor()
    await mappingExecutor.init()
  }
  return mappingExecutor
}

export async function getMappingsLookup(): Promise<IMappingsLookup> {
  if (!mappingsLookup) {
    mappingsLookup = new MappingsLookupService(getManifest().mappings)
    await mappingsLookup.load()
  }
  return mappingsLookup
}
