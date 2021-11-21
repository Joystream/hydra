// TODO: rewrite!
/* eslint-disable @typescript-eslint/naming-convention */
/* import { expect, test } from '@oclif/test'
import { baseUrl } from '../rest-client/baseUrl'
import cli from 'cli-ux'
import { getCreds } from '../creds'

describe('login command', () => {
  test
    .nock('https://github.com', (api) =>
      api.post('/login/device/code').reply(200, { user_code: 'code' })
    )
    .nock('https://github.com', (api) => {
      api
        .post('/login/oauth/access_token')
        .reply(200, { access_token: 'access', scope: '' })
    })
    .nock(baseUrl, (api) => {
      api.get('/client/me').reply(200, { username: 'user' })
    })
    .stub(cli, 'prompt', () => async () => 'Y')
    .stdout()
    .command(['login'])
    .it('shows user github username when logged in', (ctx) => {
      expect(
        ctx.stdout.indexOf(
          'Waiting for GitHub response... Successfully logged as user'
        )
      ).to.satisfy((index: number) => index > 0)
      expect(getCreds()).to.equal('access')
    })
}) */
