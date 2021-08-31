import execa from 'execa'
import { getWarthogEnv } from './warthog-env'

export async function warthogexec(cmd: string[]): Promise<boolean> {
  const warthog = require.resolve('@subsquid/warthog/bin/warthog')

  const result = await execa(warthog, cmd, {
    env: {
      ...getWarthogEnv(),
      WARTHOG_DB_OVERRIDE: 'true',
    },
  })

  if (result instanceof Error) {
    console.error(result)
    return false
  } else {
    if (result.stdout) {
      console.error(result.stdout)
    }
    if (result.stderr) {
      console.error(result.stderr)
    }
    return true
  }
}
