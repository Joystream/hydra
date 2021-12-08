import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { log } from '../../rest-client/routes/log'
import { parseNameAndVersion } from '../../utils/helper'

const debug = Debug('qnode-cli:log')

export default class Tail extends Command {
  static description = 'Getting logs about version'
  static args = [
    {
      name: 'nameAndVersion',
      description: 'name@version',
      required: true,
    },
  ]

  static flags = {
    follow: flags.boolean({
      char: 'f',
      description: 'will continue streaming the new logs',
      required: false,
      default: false,
    }),
    lines: flags.integer({
      char: 'l',
      description: 'output a specific number of lines (if "follow" is false)',
      required: false,
      default: 50,
    }),
  }

  async run(): Promise<void> {
    const { flags, args } = this.parse(Tail)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}, args: ${args}`)
    const nameAndVersion = args.nameAndVersion
    const { squidName, versionName } = parseNameAndVersion(nameAndVersion, this)
    const follow = flags.follow
    const lines = flags.lines

    this.log('Getting logs...')
    await log(squidName, versionName, follow, lines)
  }
}
