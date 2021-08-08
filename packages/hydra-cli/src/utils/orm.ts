import * as path from 'path'
import execa from 'execa'
import { getWarthogEnv } from './warthog-env'

function getConfig(): string {
  return path.relative(
    // typeorm doesn't handle absolute paths correctly
    process.cwd(),
    require.resolve('./ormconfig')
  )
}

export async function ormexec(cmd: string[]): Promise<boolean> {
  const proc = execa(
    'node',
    [
      '--require',
      'ts-node/register',
      require.resolve('typeorm/cli.js'),
      ...cmd,
      '--config',
      getConfig(),
    ],
    {
      env: getWarthogEnv(), // warthog environment for decorators
    }
  )

  proc.stdout?.pipe(process.stdout)
  proc.stderr?.pipe(process.stderr)

  const result = await proc
  if (result instanceof Error) {
    if (!result.stderr) {
      console.error(result)
    }
    return false
  } else {
    return true
  }
}
