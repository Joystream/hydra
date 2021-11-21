import { Command, flags } from '@oclif/command'
import { setCreds } from '../creds'
import { me as identifyMe } from '../rest-client'

export default class Auth extends Command {
  static description = `Authenticate for saas management`

  static flags = {
    key: flags.string({
      char: 'k',
      description: 'Obtained access key for CLI',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Auth)
    const accessKey = flags.key
    setCreds(accessKey)
    const identificationMessage = await identifyMe(accessKey)
    this.log(identificationMessage)
  }
}
