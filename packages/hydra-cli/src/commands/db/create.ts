import * as dotenv from 'dotenv'
import { Command } from '@oclif/command'
import { warthogexec } from '../../utils/warthog-exec'

export default class CreateDb extends Command {
  static description = 'Create target database'

  async run(): Promise<void> {
    dotenv.config()
    const ok = await warthogexec(['db:create']) // TODO: no need for warthog here
    process.exit(ok ? 0 : 1)
  }
}
