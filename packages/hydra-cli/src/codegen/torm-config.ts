/**
 * Update typeorms' .env config file with top level .env file
 */
export function getTypeormConfig(): string {
  const envConfig = {} as Record<string, unknown>

  envConfig.TYPEORM_DATABASE = process.env.DB_NAME
  envConfig.TYPEORM_USERNAME = process.env.DB_USER
  envConfig.TYPEORM_PASSWORD = process.env.DB_PASS
  envConfig.TYPEORM_HOST = process.env.DB_HOST
  envConfig.TYPEORM_PORT = process.env.DB_PORT

  return Object.keys(envConfig)
    .map((key) => `${key}=${envConfig[key]}`)
    .join('\n')
}
