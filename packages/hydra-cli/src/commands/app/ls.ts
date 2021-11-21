import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { appList } from '../../rest-client/routes/apps'
import Debug from 'debug'
import { deploymentList } from '../../rest-client/routes/deployments'

const debug = Debug('qnode-cli:deployment-list')
export default class Ls extends Command {
  static description = 'App or deployments list'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'app name',
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
    const appName = flags.name

    if (appName) {
      const deployments = await deploymentList(appName)
      if (deployments) {
        cli.table(
          deployments,
          {
            version: { header: 'version' },
            artifactUrl: { header: 'artifactUrl' },
            deploymentUrl: { header: 'deploymentUrl' },
            status: {},
            createdAt: { header: 'Created at' },
          },
          { 'no-truncate': noTruncate }
        )
      }
    } else {
      const apps = await appList()
      if (apps) {
        cli.table(
          apps,
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
