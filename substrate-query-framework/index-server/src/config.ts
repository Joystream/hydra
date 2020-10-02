import * as dotenv from 'dotenv'
import * as path from 'path'

export function loadConfig(): void {
  delete process.env.NODE_ENV
  dotenv.config({ path: path.join(__dirname, '../.env') })
}

/**
 * Get an environment variable or throw an error if the variable is missing
 *
 * @param envName environment name
 */
export function requiredEnv(envName: string): string {
  if (process.env[envName] === undefined) {
    throw new Error(`The environment variable ${envName} must be set`)
  }
  return process.env[envName] as string
}
