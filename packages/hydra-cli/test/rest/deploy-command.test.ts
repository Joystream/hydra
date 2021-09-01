import { expect, test } from '@oclif/test'
import { baseUrl } from '../../src/rest-client/baseUrl'
import simpleGit from 'simple-git'
import * as creds from '../../src/creds'

const successResponseFixture = {
  status: 'CREATED',
  name: 'elated_leavitt',
  artifactUrl: 'https://github.com/nock/nock',
}

const unauthorizedResponseFixture = {
  name: 'UnauthorizedError',
  message: '',
  label: 'UNAUTHORIZED_ERROR',
}

describe('deploy command', () => {
  const preset = test
    .stub(simpleGit, 'getRemotes', () => () => [
      { name: 'origin', refs: { fetch: 'origin', push: 'origin' } },
      { name: 'upstream', refs: { fetch: 'upstream', push: 'upstream' } },
    ])
    .stub(simpleGit, 'branch', () => () => {
      return { current: 'master' }
    })

  preset
    .nock(baseUrl, (api) => {
      api.post('/client/deployment').reply(200, successResponseFixture)
    })
    .stdout()
    .do(() => creds.setCreds('test_creds')) // perhaps we got a right creds
    .command(['deploy', '-n', successResponseFixture.name])
    .it('show success message when rest response is 200', (ctx) => {
      expect(ctx.stdout).to.equal(
        `Created deployment with name ${successResponseFixture.name}\n`
      )
    })

  preset
    .stdout()
    .do(() => creds.deleteCreds()) // perhaps we got no creds
    .command(['deploy', '-n', successResponseFixture.name])
    .catch((err) =>
      expect(err.message).to.equal(
        `Credentials data not found. Run hydra-cli login`
      )
    )
    .it('show error message when not logged in')

  preset
    .nock(baseUrl, (api) => {
      api.post('/client/deployment').reply(401, unauthorizedResponseFixture)
    })
    .stdout()
    .do(() => creds.setCreds('test_creds')) // perhaps we got an expired or broken creds
    .command(['deploy', '-n', successResponseFixture.name])
    .catch((err) =>
      expect(err.message.indexOf('status 401')).to.satisfy((index) => index > 0)
    )
    .it('show error message when broken creds')
})
