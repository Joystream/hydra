import * as fs from 'fs'
import * as path from 'path'
import type { ConnectionOptions } from 'typeorm'
import { ProcessedEventsLogEntity } from '../entities/ProcessedEventsLogEntity'

export default function config(): ConnectionOptions {
  const cfg = loadOrmConfig()
  return {
    ...cfg,
    migrations: [path.resolve(__dirname, '../migrations/*.js')],
    entities: [...(cfg.entities || []), ProcessedEventsLogEntity],
  }
}

function loadOrmConfig(): ConnectionOptions {
  const loc = 'lib/generated/ormconfig.js'
  if (fs.existsSync(loc)) {
    return require(path.resolve(loc))
  } else {
    throw new Error(
      `Failed to locate ormconfig at ${loc}. Did you forget to run codegen or compile the code?`
    )
  }
}
