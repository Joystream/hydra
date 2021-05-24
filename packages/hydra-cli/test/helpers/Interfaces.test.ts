import { expect } from 'chai'
import * as fs from 'fs-extra'
import { WarthogModelBuilder } from '../../src/parse/WarthogModelBuilder'
import { WarthogModel } from '../../src/model'
import { ModelRenderer } from '../../src/generate/ModelRenderer'

describe('InterfaceRenderer', () => {
  let generator: ModelRenderer
  let warthogModel: WarthogModel
  let modelTemplate: string
  let serviceTemplate: string

  before(() => {
    // set timestamp in the context to make the output predictable
    modelTemplate = fs.readFileSync(
      './src/templates/entities/model.ts.mst',
      'utf-8'
    )
    serviceTemplate = fs.readFileSync(
      './src/templates/interfaces/service.ts.mst',
      'utf-8'
    )

    warthogModel = new WarthogModelBuilder(
      'test/fixtures/interfaces.graphql'
    ).buildWarthogModel()

    generator = new ModelRenderer(
      warthogModel,
      warthogModel.lookupInterface('MembershipEvent')
    )
  })

  it('should render interface with enum field', () => {
    const rendered = generator.render(modelTemplate)

    expect(rendered).include(
      `@EnumField('MembershipEventTypeOptions', MembershipEventTypeOptions,`,
      'shoud have an EnumField'
    )
  })

  it(`should fetch relations by default`, () => {
    const rendered = generator.render(serviceTemplate)

    expect(rendered).include(
      'membershipInvitedEventsQuery.leftJoin(`membershipinvitedevent.event`, `event`)',
      'should do leftJoin'
    )
  })

  it(`should do filtering with enum`, () => {
    const rendered = generator.render(serviceTemplate)

    expect(rendered).include(
      `import { MembershipEventTypeOptions } from '../enums/enums'`,
      'should import auto generated enum'
    )

    expect(rendered).include(
      `if (filteredTypes.includes(MembershipEventTypeOptions.MembershipInvitedEvent))`,
      'should do filtering for implementers'
    )
  })
})
