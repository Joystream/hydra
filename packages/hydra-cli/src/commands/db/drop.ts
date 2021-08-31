import * as dotenv from 'dotenv'
import { Command } from '@oclif/command'
import { warthogexec } from '../../utils/warthog-exec'

export default class DropDb extends Command {
  static description = 'Drop target database'

  async run(): Promise<void> {
    dotenv.config()
    const ok = await warthogexec(['db:drop']) // TODO: no need for warthog here
    process.exit(ok ? 0 : 1)
  }
}
