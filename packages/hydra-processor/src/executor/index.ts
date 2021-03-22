import { IMappingExecutor } from './IMappingExecutor'
import { TransactionalExecutor } from './TransactionalExecutor'

let mappingExecutor: IMappingExecutor

export * from './IMappingExecutor'
export * from './TransactionalExecutor'

export const getMappingExecutor: () => IMappingExecutor = () => {
  if (!mappingExecutor) {
    mappingExecutor = new TransactionalExecutor()
  }
  return mappingExecutor
}
