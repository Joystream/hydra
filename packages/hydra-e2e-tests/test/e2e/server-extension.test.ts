import { expect } from 'chai'
import { gql } from 'graphql-request'
import { getGQLClient, waitForProcessing } from './api/processor-api'

describe('server-extension', () => {
  before(() => waitForProcessing())

  it('discovers shallow resolvers', async () => {
    const response = await getGQLClient().request(gql`
      query {
        shallowHello {
          greeting
        }
      }
    `)
    expect(response).to.deep.equal({
      shallowHello: {
        greeting: 'Hello world',
      },
    })
  })

  it('discovers deep resolvers', async () => {
    const response = await getGQLClient().request(gql`
      query {
        deepHello {
          greeting
        }
      }
    `)
    expect(response).to.deep.equal({
      deepHello: {
        greeting: 'Hello world',
      },
    })
  })

  it('discovers deep and shallow models', async () => {
    const response = await getGQLClient().request(gql`
      query {
        deepModel {
          greeting
        }
        shallowModel {
          greeting
        }
      }
    `)
    expect(response).to.have.property('deepModel').instanceOf(Array)
    expect(response).to.have.property('shallowModel').instanceOf(Array)
  })
})
