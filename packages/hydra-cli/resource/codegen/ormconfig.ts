import * as path from 'path'
import { ConnectionOptions, DefaultNamingStrategy } from 'typeorm'
import { underscore as snakeCase } from 'inflected'

class SnakeNamingStrategy extends DefaultNamingStrategy {
  tableName(className: string, customName?: string): string {
    return customName || snakeCase(className)
  }

  columnName(
    propertyName: string,
    customName?: string,
    embeddedPrefixes: string[] = []
  ): string {
    return (
      snakeCase(embeddedPrefixes.join('_')) +
      (customName || snakeCase(propertyName))
    )
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName)
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(`${relationName}_${referencedColumnName}`)
  }

  joinTableName(firstTableName: string, secondTableName: string): string {
    return snakeCase(`${firstTableName}_${secondTableName}`)
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string
  ): string {
    return `${snakeCase(tableName)}_${columnName || snakeCase(propertyName)}`
  }
}

const migrationsDir = path.join(__dirname, '../../db/migrations')

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  namingStrategy: new SnakeNamingStrategy(),
  entities: [require.resolve('./model')],
  migrations: [migrationsDir + '/*.js'],
  cli: {
    migrationsDir,
  },
}

module.exports = config
