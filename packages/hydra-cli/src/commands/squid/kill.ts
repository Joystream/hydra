import { Command } from '@oclif/command'
import Debug from 'debug'
import { destroyApp, destroyDeployment } from '../../rest-client/routes/destroy'
import { parseNameAndVersion } from '../../utils/helper'

const debug = Debug('qnode-cli:delete')

export default class Kill extends Command {
  static description = 'Kill squid or version'
  static args = [
    {
      name: 'nameAndVersion',
      description: '<name> or <name@version>',
      required: true,
    },
  ]

  async run(): Promise<void> {
    const { flags, args } = this.parse(Kill)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}, args: ${args}`)
    const params: string = args.nameAndVersion
    let message
    if (params.includes('@')) {
      const { squidName, versionName } = parseNameAndVersion(params, this)
      message = await destroyDeployment(squidName, versionName)
    } else {
      message = await destroyApp(params)
    }
    this.log(message)
  }
}
