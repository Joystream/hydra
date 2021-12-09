import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { destroyApp, destroyDeployment } from '../../rest-client/routes/destroy'

const debug = Debug('qnode-cli:delete')

export default class Delete extends Command {
  static description = 'Delete app or deployment'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'app name',
      required: true,
    }),
    version: flags.string({
      char: 'v',
      description: 'version name',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Delete)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const appName = flags.name
    const version = flags.version
    let message
    if (version) {
      message = await destroyDeployment(appName, version)
    } else {
      message = await destroyApp(appName)
    }
    this.log(message)
  }
}
