import spies from 'chai-spies'
import chai from 'chai'

chai.use(spies)

const sandbox = chai.spy.sandbox()

describe('MappingsProcessor', () => {
  afterEach(() => {
    sandbox.restore()
  })
})
