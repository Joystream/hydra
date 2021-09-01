import { Command, flags } from '@oclif/command'
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import Debug from 'debug'
import { deploy } from '../rest-client/routes/deploy'

const debug = Debug('qnode-cli:deploy')
const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
}
const git: SimpleGit = simpleGit(options)
const remoteUrlName = 'origin'

export default class Deploy extends Command {
  static description = 'Deploy'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'Deployment name',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Deploy)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const deploymentName = flags.name

    const remotes = await git.getRemotes(true)
    const remoteUrl = remotes.find((remote) => remote.name === remoteUrlName)
    if (!remoteUrl) {
      throw Error(`Remote url with name ${remoteUrlName} not exists`)
    }
    const branch = (await git.branch()).current

    const message = await deploy(
      deploymentName,
      `${remoteUrl.refs.fetch}#${branch}`
    )
    this.log(message)
  }
}
