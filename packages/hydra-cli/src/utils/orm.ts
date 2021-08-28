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
  const tsOptions =
    process.env.HYDRA_NO_TS === 'true' ? [] : ['--require', 'ts-node/register']

  const proc = execa(
    'node',
    [
      ...tsOptions,
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
