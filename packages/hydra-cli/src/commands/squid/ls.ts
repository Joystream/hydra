import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { squidList } from '../../rest-client/routes/squids'
import Debug from 'debug'
import { versionList } from '../../rest-client/routes/versions'

const debug = Debug('qnode-cli:deployment-list')
export default class Ls extends Command {
  static description = 'Squid or versions list'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'squid name',
      required: false,
    }),
    truncate: flags.boolean({
      char: 't',
      description: 'truncate data in columns: false by default',
      required: false,
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Ls)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const noTruncate = !flags.truncate
    const squidName = flags.name

    if (squidName) {
      const deployments = await versionList(squidName)
      if (deployments) {
        cli.table(
          deployments,
          {
            name: { header: 'version name' },
            artifactUrl: { header: 'artifactUrl' },
            deploymentUrl: { header: 'deploymentUrl' },
            status: {},
            createdAt: { header: 'Created at' },
          },
          { 'no-truncate': noTruncate }
        )
      }
    } else {
      const squids = await squidList()
      if (squids) {
        cli.table(
          squids,
          {
            name: {},
            description: {},
          },
          { 'no-truncate': noTruncate }
        )
      }
    }
  }
}
