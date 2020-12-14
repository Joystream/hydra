import { WarthogModelBuilder } from '../../src/parse/WarthogModelBuilder'
import { expect } from 'chai'

describe('ExplicitIdFieldRemoval', () => {
  it('should remove id field from entities', () => {
    const generator = new WarthogModelBuilder(
      'test/fixtures/explicit-id-field.graphql'
    )
    const model = generator.buildWarthogModel()

    const entities = model.entities.map((e) => e.name)
    const fields: string[] = []
    model.entities.forEach((e) => e.fields.map((f) => fields.push(f.name)))

    expect(fields).to.not.include('id', 'Should not detect id field')
    expect(entities).to.include.members(
      ['Category', 'Thread', 'Post'],
      'Should detect three entities'
    )
  })
})
