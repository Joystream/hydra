import { expect } from 'chai'
import { describe } from 'mocha'
import spies from 'chai-spies'

chai.use(spies)

const sandbox = chai.spy.sandbox()

describe('MappingsProcessor', () => {
  beforeEach(() => {
    
  })

  afterEach(() => {
    sandbox.restore()
  })
})
