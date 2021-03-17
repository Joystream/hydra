import { expect } from 'chai'
import * as fs from 'fs-extra'
import { EnumContextProvider } from '../../src/generate/EnumContextProvider'
import { ModelRenderer } from '../../src/generate/ModelRenderer'
import { RelationshipGenerator } from '../../src/generate/RelationshipGenerator'
import { fromStringSchema } from './model'

describe('Entity Relationships', () => {
  let generator: ModelRenderer
  let modelTemplate: string
  let enumCtxProvider: EnumContextProvider

  before(() => {
    modelTemplate = fs.readFileSync(
      './src/templates/entities/model.ts.mst',
      'utf-8'
    )
  })

  it('should not create import statement for self referenced entities', () => {
    const model = fromStringSchema(`
    type Member @entity {
      invitor: Member
      invitees: [Member!] @derivedFrom(field: "invitor")
    }`)
    generator = new ModelRenderer(
      model,
      model.lookupEntity('Member'),
      enumCtxProvider
    )
    const rendered = generator.render(modelTemplate)
    expect(rendered).to.not.include(
      `import { Member } from '../member/member.model.ts'`
    )
  })

  it('should include only one relationship', () => {
    const model = fromStringSchema(`
    type Channel @entity {
      id: ID!
      category: ChannelCategory
    }

    type ChannelCategory @entity {
      id: ID!
      channels: [Channel!] @derivedFrom(field: "category")
    }
    `)

    const relGenerator = new RelationshipGenerator(model)
    relGenerator.generate()
    expect(relGenerator.relationships.length).to.be.equal(1)
  })
})
