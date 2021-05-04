import { MappingsLookupService } from '..'
import { getManifest } from '../start/config'
import { IMappingExecutor } from './IMappingExecutor'
import { IMappingsLookup } from './IMappingsLookup'
import { TransactionalExecutor } from './TransactionalExecutor'

let mappingExecutor: TransactionalExecutor
let mappingsLookup: MappingsLookupService

export * from './IMappingExecutor'
export * from './TransactionalExecutor'

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
