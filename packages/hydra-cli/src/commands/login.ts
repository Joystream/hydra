import { Command } from '@oclif/command'
import cli from 'cli-ux'
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device'
import { Verification } from '@octokit/auth-oauth-device/dist-src'
import { setCreds } from '../creds'
import { me as identifyMe } from '../rest-client'

export default class Login extends Command {
  static description = `Login for saas management`
  async run(): Promise<void> {
    const auth = createOAuthDeviceAuth({
      clientType: 'oauth-app',
      clientId: '5c7874d514287376e203', // maybe fetch from api
      onVerification(verification: Verification) {
        console.log('Open %s', verification.verification_uri)
        console.log('Enter code: %s', verification.user_code)
        cli.action.start('Waiting for GitHub response', 'initializing', {
          stdout: true,
        })
      },
    })
    const tokenAuthentication = await auth({
      type: 'oauth',
    })
    const identificationMessage = await identifyMe(tokenAuthentication.token)
    setCreds(tokenAuthentication.token)
    cli.action.stop(identificationMessage)
  }
}
