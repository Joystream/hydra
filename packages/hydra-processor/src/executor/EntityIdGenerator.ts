import { EntityManager } from 'typeorm'
import { ObjectType } from 'typedi'
import AsyncLock from 'async-lock'
import { DeterministicIdEntity } from '../entities'

export class EntityIdGenerator {
  private entityClass: ObjectType<{ id: string }>
  private entityRecord: DeterministicIdEntity | null = null
  private static lock = new AsyncLock({ maxPending: 10000 })
  // each id is 8 chars out of 36-size alphabet, giving us 2821109907456 possible ids (per entity type)
  public static alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'

  public static idSize = 8

  // this id will actually never by used in db - use .entityIdAfter(zeroEntityId) to get first id
  public static zeroEntityId = Array.from(
    { length: EntityIdGenerator.idSize },
    () => EntityIdGenerator.alphabet[0]
  ).join('')

  constructor(entityClass: ObjectType<{ id: string }>) {
    this.entityClass = entityClass
  }

  public static entityIdAfter(id: string): string {
    const { alphabet, idSize } = EntityIdGenerator
    let targetIdIndexToChange = idSize - 1
    while (
      targetIdIndexToChange >= 0 &&
      id[targetIdIndexToChange] === alphabet[alphabet.length - 1]
    ) {
      --targetIdIndexToChange
    }

    if (targetIdIndexToChange < 0) {
      throw new Error(`EntityIdGenerator: Cannot get entity id after: ${id}!`)
    }

    const nextEntityIdChars = [...id]
    const nextAlphabetCharIndex =
      alphabet.indexOf(id[targetIdIndexToChange]) + 1
    nextEntityIdChars[targetIdIndexToChange] = alphabet[nextAlphabetCharIndex]
    for (let i = idSize - 1; i > targetIdIndexToChange; --i) {
      nextEntityIdChars[i] = alphabet[0]
    }

    return nextEntityIdChars.join('')
  }

  private async loadEntityRecord(
    em: EntityManager
  ): Promise<DeterministicIdEntity> {
    if (this.entityRecord) {
      return this.entityRecord
    }

    // try load record from db
    this.entityRecord = await em.findOne(DeterministicIdEntity, {
      where: { className: this.entityClass.name },
    })

    // create new record if none exists
    if (!this.entityRecord) {
      this.entityRecord = new DeterministicIdEntity()
      this.entityRecord.className = this.entityClass.name
      this.entityRecord.highestId = EntityIdGenerator.zeroEntityId
    }

    return this.entityRecord
  }

  private async generateNextEntityId(em: EntityManager): Promise<string> {
    // ensure entity record
    const entityRecord = await this.loadEntityRecord(em)

    // generate next id
    const nextEntityId = EntityIdGenerator.entityIdAfter(entityRecord.highestId)

    // save new id to db
    entityRecord.highestId = nextEntityId
    await em.save(entityRecord)

    // return next id
    return nextEntityId
  }

  public async getNextEntityId(em: EntityManager): Promise<string> {
    return EntityIdGenerator.lock.acquire(this.entityClass.name, () =>
      this.generateNextEntityId(em)
    )
  }
}

const entityIdGenerators = new Map<string, EntityIdGenerator>()

/*
  Ensures entity id generator exists for the given entity class
*/
function ensureEntityIdGenerator(
  entityClass: ObjectType<{ id: string }>
): EntityIdGenerator {
  if (!entityIdGenerators.has(entityClass.name)) {
    entityIdGenerators.set(entityClass.name, new EntityIdGenerator(entityClass))
  }

  return entityIdGenerators.get(entityClass.name) as EntityIdGenerator
}

/*
  Generates next sequential id for the given entity class.
*/
export async function generateNextId(
  em: EntityManager,
  entityClass: ObjectType<{ id: string }>
): Promise<string> {
  const idGenerator = ensureEntityIdGenerator(entityClass)

  return idGenerator.getNextEntityId(em)
}
