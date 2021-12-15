import { Command, flags } from '@oclif/command'
import { release } from '../../rest-client/routes/release'
import Debug from 'debug'
import simpleGit, {
  DefaultLogFields,
  LogOptions,
  RemoteWithRefs,
  SimpleGit,
  SimpleGitOptions,
} from 'simple-git'
import cliSelect from 'cli-select'
import cli from 'cli-ux'
import {
  DeployPipelineStatusEnum,
  getDeployPipeline,
} from '../../rest-client/routes/pipeline'
import { parseNameAndVersion } from '../../utils/helper'

const debug = Debug('qnode-cli:deploy')
const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
}
const git: SimpleGit = simpleGit(options)

export default class Release extends Command {
  static description = 'Create a version'
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
    description: flags.string({
      char: 'd',
      description: 'description',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags, args } = this.parse(Release)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}, args: ${args}`)
    const description = flags.description
    const nameAndVersion = args.nameAndVersion
    const { squidName, versionName } = parseNameAndVersion(nameAndVersion, this)
    let deployUrl = flags.source
    if (!deployUrl) {
      let remoteUrl: RemoteWithRefs
      const remotes = await git.getRemotes(true)
      if (remotes.length === 0) {
        this.error(`The remotes were not found`, { code: '1' })
      } else if (remotes.length === 1) {
        remoteUrl = remotes[0]
      } else {
        const selected = await cliSelect({
          cleanup: false,
          values: remotes.map((remote) => remote.name),
        }).catch(() => {
          this.error('Canceled', { code: '1' })
        })
        remoteUrl = remotes.find(
          (remote) => remote.name === selected.value
        ) as RemoteWithRefs
      }
      await git.listRemote([remoteUrl.name]).catch(() => {
        this.error(`Remote url with name ${remoteUrl.name} not exists`, {
          code: '1',
        })
      })
      const branch = (await git.branch()).current
      const status = await git.status()
      if (status.files && status.files.length) {
        this.error(`There are unstaged or uncommitted changes`)
      }
      await git.fetch()
      const remoteBranchRefs = await git.listRemote([
        `${remoteUrl.name}`,
        `${branch}`,
      ])
      if (remoteBranchRefs === '') {
        this.error(`Remote branch "${remoteUrl.name}/${branch}" not exists`)
      }
      const localCommit = await git.log([
        '-n',
        1,
        branch,
      ] as LogOptions<DefaultLogFields>)
      const remoteCommit = await git.log([
        '-n',
        1,
        `${remoteUrl.name}/${branch}`,
      ] as LogOptions<DefaultLogFields>)
      if (
        !localCommit.latest ||
        !remoteCommit.latest ||
        localCommit.latest.hash !== remoteCommit.latest.hash
      ) {
        this.error(
          `Head origin commit is not the same as the local origin commit`
        )
      }
      deployUrl = `${remoteUrl.refs.fetch}${
        remoteUrl.refs.fetch.endsWith('.git') ? '' : '.git'
      }#${remoteCommit.latest.hash}`
    } else {
      deployUrl = deployUrl.split('#')[0].endsWith('.git')
        ? deployUrl
        : `${deployUrl.split('#')[0]}.git${
            deployUrl.split('#')[1] ? '#' + deployUrl.split('#')[1] : ''
          }`
    }
    this.log(`🦑 Releasing the Squid at ${deployUrl}`)
    const result = await release(squidName, versionName, deployUrl, description)
    this.log(
      '◷ You can detach from the resulting build process by pressing Ctrl + C. This does not cancel the deploy.'
    )
    this.log(
      '◷ The deploy will continue in the background and will create a new squid as soon as it completes.'
    )
    let inProgress = true
    let lastStatus
    while (inProgress) {
      const pipeline = await getDeployPipeline(squidName, versionName)
      if (pipeline) {
        if (pipeline.status !== lastStatus) {
          lastStatus = pipeline.status
          cli.action.stop('✔️')
        }
        switch (pipeline?.status) {
          case DeployPipelineStatusEnum.CREATED:
            cli.action.start('◷ Preparing your squid')
            if (pipeline.isErrorOccurred) {
              this.error(
                buildPipelineErrorMessage(
                  `❌ An error occurred during building process`,
                  pipeline.comment
                )
              )
            }
            break
          case DeployPipelineStatusEnum.IMAGE_BUILDING:
            cli.action.start('◷ Building your squid')
            if (pipeline.isErrorOccurred) {
              this.error(
                buildPipelineErrorMessage(
                  `❌ An error occurred during building process`,
                  pipeline.comment
                )
              )
            }
            break
          case DeployPipelineStatusEnum.IMAGE_PUSHING:
            cli.action.start('◷ Publishing your squid')
            if (pipeline.isErrorOccurred) {
              this.error(
                buildPipelineErrorMessage(
                  `❌ An error occurred during pushing process`,
                  pipeline.comment
                )
              )
            }
            break
          case DeployPipelineStatusEnum.DEPLOYING:
            cli.action.start('◷ Almost ready')
            if (pipeline.isErrorOccurred) {
              this.error(
                buildPipelineErrorMessage(
                  `❌ An error occurred during deploying process`,
                  pipeline.comment
                )
              )
            }
            break
          case DeployPipelineStatusEnum.OK:
            this.log(
              `◷ Your squid almost ready and will be accessible on ${result?.version.deploymentUrl}`
            )
            inProgress = false
            break
          default:
            this.error('❌ An error occurred. Unexpected status of pipeline.')
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
    this.log('✔️ Done!')
  }
}

function buildPipelineErrorMessage(text: string, errorMessage: string): string {
  return `${text} ${errorMessage ? `: ${errorMessage}` : ''}`
}
