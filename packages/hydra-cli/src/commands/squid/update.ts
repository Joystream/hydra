import { Command, flags } from '@oclif/command'
import { update } from '../../rest-client/routes/update'
import Debug from 'debug'
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import {
  buildRemoteUrlFromGit,
  pollDeployPipelines,
  parseNameAndVersion,
} from '../../utils/helper'

const debug = Debug('qnode-cli:update')
const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
}
const git: SimpleGit = simpleGit(options)

export default class Update extends Command {
  static description = 'Update a version image'
  static args = [
    {
      name: 'nameAndVersion',
      description: 'name@version',
      required: true,
    },
  ]

  static flags = {
    source: flags.string({
      char: 's',
      description: 'source',
      required: false,
    }),
    hardReset: flags.boolean({
      char: 'r',
      description: 'perform a hard reset (db wipeout)',
      required: false,
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags, args } = this.parse(Update)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}, args: ${args}`)
    const nameAndVersion = args.nameAndVersion
    const { squidName, versionName } = parseNameAndVersion(nameAndVersion, this)
    let deployUrl = flags.source
    if (!deployUrl) {
      deployUrl = await buildRemoteUrlFromGit(git, this)
    } else {
      deployUrl = deployUrl.split('#')[0].endsWith('.git')
        ? deployUrl
        : `${deployUrl.split('#')[0]}.git${
            deployUrl.split('#')[1] ? '#' + deployUrl.split('#')[1] : ''
          }`
    }
    this.log(`🦑 Releasing the Squid at ${deployUrl}`)
    const result = await update(
      squidName,
      versionName,
      deployUrl,
      flags.hardReset
    )
    this.log(
      '◷ You can detach from the resulting build process by pressing Ctrl + C. This does not cancel the deploy.'
    )
    this.log(
      '◷ The deploy will continue in the background and will create a new squid as soon as it completes.'
    )
    await pollDeployPipelines(
      squidName,
      versionName,
      result?.deploymentUrl || '',
      this
    )
    this.log('✔️ Done!')
  }
}
