import { fromStringSchema } from './model'
import { expect } from 'chai'
import { compact as c } from '../../src/generate/utils'
import { VariantsRenderer } from '../../src/generate/VariantsRenderer'
import * as fs from 'fs'

describe('VariantsRenderer', () => {
  let variantsTemplate: string

  before(() => {
    // set timestamp in the context to make the output predictable
    variantsTemplate = fs.readFileSync(
      './src/templates/variants/variants.mst',
      'utf-8'
    )
  })

  it('Should render union types', () => {
    const model = fromStringSchema(`
    union Poor = HappyPoor | Miserable
    type HappyPoor @variant {
      father: Poor!
      mother: Poor!
    }

    type Miserable @variant {
      hates: String!
    }

    type MyEntity @entity {
      status: Poor!
    }`)

    const gen = new VariantsRenderer(model)
    const rendered = gen.render(variantsTemplate)

    expect(rendered).include(
      'export const Poor = createUnionType',
      'Should create a union type'
    )
    expect(rendered).include(
      'types: () => [HappyPoor, Miserable]',
      'Should join types'
    )
    expect(rendered).include('mother!: typeof Poor', 'Should define field')
  })

  it('Should import enums', () => {
    const model = fromStringSchema(`
    enum GeN_ERa_TION {
      BOOMER, ZOOMER, GENEXER
    }

    union Status = MiddleClass | Rich

    type Rich @variant {
      bank: String!
    }

    type MiddleClass @variant {
      generation: GeN_ERa_TION
    }`)

    const gen = new VariantsRenderer(model)
    const rendered = gen.render(variantsTemplate)

    expect(rendered).include(
      `import { GeN_ERa_TION } from '../enums/enums'`,
      'Should import enums'
    )
  })

  it('Should import BN module', () => {
    const model = fromStringSchema(`
    type Rich @variant {
      balance: BigInt
    }`)

    const gen = new VariantsRenderer(model)
    const rendered = gen.render(variantsTemplate)

    expect(rendered).include(`import BN from 'bn.js'`)
  })

  it('Should generate data fetch method', () => {
    const model = fromStringSchema(`
    type BoughtMemberEvent @entity {
      id: ID!
      name: String
    }

    type MemberInvitation @variant {
      event: BoughtMemberEvent!
    }

    type MemberPurchase @variant {
      event: BoughtMemberEvent!
    }

    union MemberSource = MemberInvitation | MemberPurchase

    type Member @entity {
      id: ID!
      handle: String!
      source: MemberSource!
    }`)

    const gen = new VariantsRenderer(model)
    const rendered = gen.render(variantsTemplate)
    expect(rendered).to.include(
      `static async fetchDataevent(records: any, unionFieldName: string) {`,
      'should generate data fetching method'
    )
    expect(rendered).to.include(
      `@Field(() => BoughtMemberEvent`,
      'should add field decorator'
    )
    expect(rendered).to.include(
      `
  @StringField({ dbOnly: true })
  eventId!: string;`,
      'should generated additional field'
    )
  })

  it('Should render array fields', () => {
    const model = fromStringSchema(`
    type Miserable @variant {
      hates: String
      x: Boolean!
      y: Int
      z: BigInt!
      u: DateTime!
      loves: [String]!
      maybeLoves: [String]
    }`)
    const gen = new VariantsRenderer(model)
    const rendered = c(gen.render(variantsTemplate))
    expect(rendered).to.include(
      c(`@Field(() => String, { nullable: true, }) hates?: string`),
      'should render nullable fields'
    )

    expect(rendered).to.include(
      c(`@Field(() => [String]!, {}) loves!: string[]`),
      'should render array fields'
    )

    expect(rendered).to.include(
      c(`@Field(() => [String], { nullable: true, }) maybeLoves?: string[]`),
      'should render nullable array fields'
    )
  })
})
