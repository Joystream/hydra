import { DatabaseManager, DeepPartial } from '@dzlzv/hydra-common'
import pImmediate from 'p-immediate'

export class DummyDatabaseManager implements DatabaseManager {
  async save<T>(entity: DeepPartial<T>): Promise<void> {
    await pImmediate()
  }
  async remove<T>(entity: DeepPartial<T>): Promise<void> {
    await pImmediate()
  }
  async get<T, TFindOptions>(
    entity: new (...args: any[]) => T,
    options: TFindOptions
  ): Promise<T | undefined> {
    await pImmediate()
    return new entity()
  }

  async getMany<T, TFindOptions>(
    entity: new (...args: any[]) => T,
    options: TFindOptions
  ): Promise<T[]> {
    await pImmediate()
    return []
  }
}
