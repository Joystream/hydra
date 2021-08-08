export function getWarthogEnv(): any {
  const env = process.env
  return {
    WARTHOG_GENERATED_FOLDER: 'generated/warthog',
    WARTHOG_DB_ENTITIES: 'generated/modules/**/*.model.ts',
    WARTHOG_RESOLVERS_PATH:
      'generated/modules/**/*.resolver.ts,generated/server/**/*.resolver.ts',
    WARTHOG_DB_MIGRATIONS: 'db/migrations/*.ts',
    WARTHOG_DB_MIGRATIONS_DIR: 'db/migrations',
    WARTHOG_DB_DATABASE: env.DB_NAME || 'none',
    WARTHOG_DB_USERNAME: env.DB_USER || 'none',
    WARTHOG_DB_PASSWORD: env.DB_PASS || 'none',
    WARTHOG_DB_HOST: env.DB_HOST || 'localhost',
    WARTHOG_DB_PORT: env.DB_PORT || '5432',
    WARTHOG_APP_PORT: env.GRAPHQL_SERVER_PORT || '4000',
    WARTHOG_APP_HOST: env.GRAPHQL_SERVER_HOST || 'localhost',
  }
}

export function configureWarthogEnv(): void {
  const copy = { ...process.env }
  Object.assign(process.env, getWarthogEnv(), copy)
}
