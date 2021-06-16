import { expect } from 'chai'
import * as fs from 'fs-extra'

import { WarthogModel } from '../../src/model'
import { ModelRenderer } from '../../src/generate/ModelRenderer'
import { JsonFieldRenderer } from '../../src/generate/JsonFieldRenderer'
import { WarthogModelBuilder } from '../../src/parse/WarthogModelBuilder'

describe('JsonFieldRenderer', () => {
  let warthogModel: WarthogModel
  let jsonFieldTemplate: string
  let modelTemplate: string

  before(() => {
    jsonFieldTemplate = fs.readFileSync(
      './src/templates/jsonfields/jsonfields.model.ts.mst',
      'utf-8'
    )
    modelTemplate = fs.readFileSync(
      './src/templates/entities/model.ts.mst',
      'utf-8'
    )

    warthogModel = new WarthogModelBuilder(
      'test/fixtures/jsonfields.graphql'
    ).buildWarthogModel()
  })

  it('shoud render typed json object', () => {
    const rendered = new JsonFieldRenderer(warthogModel).render(
      jsonFieldTemplate
    )

    expect(rendered).include(
      `@InputType('EventParamInput')\n@ObjectType()\nexport class EventParam {`,
      'shoud have class defination with decorators'
    )
  })
  it('shoud render array typed json object', () => {
    const rendered = new JsonFieldRenderer(warthogModel).render(
      jsonFieldTemplate
    )

    expect(rendered).include(
      `@Field(() => [AdditionalData])\n  additionalData!: AdditionalData[]`,
      'shoud have class defination with decorators'
    )
  })

  it('should add @JSONField to the entity defination', () => {
    const rendered = new ModelRenderer(
      warthogModel,
      warthogModel.lookupEntity('Event')
    ).render(modelTemplate)

    expect(rendered).include(
      `@JSONField({ filter: true, gqlFieldType: jsonTypes.EventParam })\n  params!: jsonTypes.EventParam;`,
      'shoud have a field with @JSONField decorator'
    )
  })
})
