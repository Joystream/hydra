import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { log } from '../../rest-client/routes/log'

const debug = Debug('qnode-cli:log')

export default class Log extends Command {
  static description = 'Getting logs about deployment'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'app name',
      required: true,
    }),
    version: flags.string({
      char: 'v',
      description: 'version name',
      required: true,
    }),
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
    const { flags } = this.parse(Log)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const appName = flags.name
    const version = flags.version
    const follow = flags.follow
    const lines = flags.lines

    this.log('Getting logs...')
    await log(appName, version, follow, lines)
  }
}
