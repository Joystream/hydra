import execa from 'execa'
import { getWarthogEnv } from './warthog-env'

export async function warthogexec(cmd: string[]): Promise<boolean> {
  const warthog = require.resolve('warthog/bin/warthog')

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
    // if (result.stdout) {
    //   console.error(result.stdout)
    // }
    // if (result.stderr) {
    //   console.error(result.stderr)
    // }
    // seems like sometimes there are nasty messages from typescript compiler,
    // but every thing in fact is fine
    // So we redirect no messages in case of 0 exit code
    return true
  }
}
