import pImmediate from 'p-immediate'

export class DummyDatabaseManager {
  async save<T>(): Promise<void> {
    await pImmediate()
  }

  async remove<T>(): Promise<void> {
    await pImmediate()
  }

  async get<T>(Entity: new (...args: any[]) => T): Promise<T | undefined> {
    await pImmediate()
    return new Entity()
  }

  async getMany<T>(): Promise<T[]> {
    await pImmediate()
    return []
  }
}
