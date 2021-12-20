import { expect } from 'chai'
import { helper } from './helpers'
import { compact as c } from '../util'

describe('helpers', () => {
  it('should render return type ', () => {
    const prmsReturn = helper.paramsReturnType.bind({
      args: ['Type1', 'Type2 & Codec', 'Option<Type3>'],
    })
    expect(c(prmsReturn())).to.equal(c(`[Type1, Type2 & Codec, Option<Type3>]`))
  })

  it('should render return type with tupes ', () => {
    const prmsReturn = helper.paramsReturnType.bind({
      args: ['Type1', 'Vec<(Type1,Type2)>'],
    })
    expect(c(prmsReturn())).to.equal(c(`[Type1, Vec<[Type1,Type2] & Codec>]`))
  })

  it('should render return type statement', () => {
    const prmsReturnStmt = helper.paramsReturnStmt.bind({
      args: ['Type1', 'Type2 & Balance'],
    })
    expect(c(prmsReturnStmt())).to.equal(
      c(`return [createTypeUnsafe(typeRegistry, 'Type1', [this.ctx.params[0].value]), 
            createTypeUnsafe(typeRegistry, 'Type2 & Balance', [this.ctx.params[1].value])]`)
    )
  })

  it('should handle tuple types', () => {
    const prmsReturnStmt = helper.paramsReturnStmt.bind({
      args: ['Vec<(Type1,Type2,(Balance1,Balance2))>'],
    })
    expect(c(prmsReturnStmt())).to.equal(
      c(
        `return [createTypeUnsafe(typeRegistry, 'Vec<(Type1,Type2,(Balance1,Balance2))>', [this.ctx.params[0].value])]`
      )
    )
  })
})
