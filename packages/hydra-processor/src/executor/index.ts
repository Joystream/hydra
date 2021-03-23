import { TransactionalExecutor } from './TransactionalExecutor'

let mappingExecutor: TransactionalExecutor

export * from './IMappingExecutor'
export * from './TransactionalExecutor'

export async function getMappingExecutor() {
  if (!mappingExecutor) {
    mappingExecutor = new TransactionalExecutor()
    await mappingExecutor.init()
  }
  return mappingExecutor
}
