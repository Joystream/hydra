import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { updateApp } from '../../rest-client/routes/update'

const debug = Debug('qnode-cli:update')

export default class Update extends Command {
  static description = 'Update app'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'app name',
      required: true,
    }),
    description: flags.string({
      char: 'd',
      description: 'description',
      required: false,
    }),
    logo: flags.string({
      char: 'l',
      description: 'logo url',
      required: false,
    }),
    source: flags.string({
      char: 's',
      description: 'source code url',
      required: false,
    }),
    website: flags.string({
      char: 'w',
      description: 'website url',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Update)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const name = flags.name
    const description = flags.description
    const logoUrl = flags.logo
    const sourceCodeUrl = flags.source
    const websiteUrl = flags.website

    this.log(`🦑 Updating ${name}`)
    const message = await updateApp(
      name,
      description,
      logoUrl,
      sourceCodeUrl,
      websiteUrl
    )
    this.log(message)
  }
}
