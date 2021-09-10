import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { deploymentList } from '../../rest-client/routes/deployments'

export default class Ls extends Command {
  static description = 'Deployments list'

  async run(): Promise<void> {
    const deployments = await deploymentList()
    if (deployments) {
      cli.table(
        deployments,
        {
          id: {},
          status: {},
          name: {},
          artifactUrl: {},
          version: {},
          deploymentUrl: {},
        },
        {}
      )
    }
  }
}
