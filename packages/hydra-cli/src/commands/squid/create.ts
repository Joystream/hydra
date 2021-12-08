import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { create } from '../../rest-client/routes/create'

const debug = Debug('qnode-cli:create')

export default class Create extends Command {
  static description = 'Create a squid'
  static args = [
    {
      name: 'name',
      description: 'squid name',
      required: true,
    },
  ]

  static flags = {
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
    website: flags.string({
      char: 'w',
      description: 'website url',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags, args } = this.parse(Create)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}, args: ${args}`)
    const name = args.name
    const description = flags.description
    const logoUrl = flags.logo
    const websiteUrl = flags.website

    const createSquidMessage = await create(
      name,
      description,
      logoUrl,
      websiteUrl
    )
    this.log(createSquidMessage)
  }
}
