import * as fs from 'fs-extra'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { run as warthogCliRun } from '@joystream/warthog/dist/cli/cli'

import { WarthogModelBuilder } from '../parse/WarthogModelBuilder'
import {
  getTemplatePath,
  parseWarthogCodegenStderr,
  resolveHydraCliPkgJson,
} from '../utils/utils'
import Debug from 'debug'
import { SourcesGenerator } from '../generate/SourcesGenerator'
import { CodegenFlags } from '../commands/codegen'
import execa = require('execa')
import Listr = require('listr')

const debug = Debug('qnode-cli:warthog-wrapper')

export default class WarthogWrapper {
  // private readonly schemaPath: string
  private readonly schemaResolvedPath: string

  // When it is set to true `dotenvi:generate` command will not run. `dotenvi:generate` requires
  // some environment variables to be set in case if you don't set them codegen will fail.
  // Since we don't have docs about the env vars user must use scaffold command first, then move on.
  private prod: boolean

  constructor(readonly flags: CodegenFlags, prod = true) {
    this.prod = prod
    this.schemaResolvedPath = path.resolve(
      process.cwd(),
      this.flags.schema as string
    )
    if (!fs.existsSync(this.schemaResolvedPath)) {
      throw new Error(
        `Cannot open the schema file or folder: ${this.schemaResolvedPath}. Check if it exists.`
      )
    }
  }

  async run(): Promise<void> {
    const skipIfNoDeps = () => {
      if (this.flags.install !== true) {
        return 'Skipping: dependencies are not installed'
      }
    }

    const skipSchema = () => {
      if (this.flags.install === true && this.flags.createDb === true) {
        return false
      }
      return `Skipping. Create the database and run the migrations with yarn db:prepare and yarn db:migrate`
    }
    // Order of calling functions is important!!!
    debug(`Passed flags: ${JSON.stringify(this.flags, null, 2)}`)
    const tasks = new Listr([
      {
        title: 'Set up a new Warthog project',
        task: async () => {
          await this.newProject()
        },
      },
      {
        title: 'Prepare project files',
        task: () => {
          this.prepareProjectFiles()
        },
      },
      {
        title: 'Generate server sources',
        task: () => {
          this.generateWarthogSources()
        },
      },
      {
        title: 'Install dependencies',
        skip: skipIfNoDeps,
        task: async () => {
          await execa('yarn', ['install'])
        },
      },
      {
        title: 'Warthog codegen',
        skip: skipIfNoDeps,
        task: async () => {
          await this.codegen()
        },
      },
      {
        title: 'Create DB',
        skip: skipSchema,
        task: async () => {
          await this.createDB()
        },
      },
      {
        title: 'Create DB schema',
        skip: skipSchema,
        task: async () => {
          await this.syncSchema()
        },
      },
      {
        title: 'Run DB migrations',
        skip: skipSchema,
        task: async () => {
          await this.runMigrations()
        },
      },
    ])

    await tasks.run()
  }

  async generateDB(): Promise<void> {
    const tasks = new Listr([
      {
        title: 'Create database',
        task: async () => {
          if (!process.env.DB_NAME) {
            throw new Error(
              'DB_NAME env variable is not set, check that .env file exists'
            )
          }
          await this.createDB()
        },
      },
      {
        title: 'Sync Schema',
        task: async () => {
          await this.syncSchema()
        },
      },
      {
        title: 'Run migrations',
        task: async () => {
          await this.runMigrations()
        },
      },
    ])
    await tasks.run()
  }

  async newProject(projectName = 'query_node'): Promise<void> {
    const consoleFn = console.log
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.log = () => {}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await warthogCliRun(['new', `${projectName}`])
    console.log = consoleFn

    this.copySourceFiles()

    await this.updateDotenv()
  }

  copySourceFiles(): void {
    // source -> dest
    const sourceFiles = [
      'src/index.ts',
      'src/server.ts',
      'src/logger.ts',
      'src/pubsub.ts',
      'src/WarthogBaseService.ts',
      'src/processor.resolver.ts',
      'tsconfig.json',
    ]

    sourceFiles.forEach((destPath) =>
      fs.copyFileSync(
        getTemplatePath(`graphql-server/${destPath}.mst`),
        path.resolve(process.cwd(), `${destPath}`)
      )
    )
  }

  prepareProjectFiles(): void {
    if (!fs.existsSync('package.json')) {
      throw new Error(
        'Could not find package.json file in the current working directory'
      )
    }

    const pkgFile = JSON.parse(fs.readFileSync('package.json', 'utf8')) as {
      version: string
      scripts: Record<string, string>
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }

    // Ensure version is greater than '0.0.0'
    pkgFile.version = pkgFile.version === '0.0.0' ? '0.0.1' : pkgFile.version

    pkgFile.scripts['db:sync'] =
      'SYNC=true WARTHOG_DB_SYNCHRONIZE=true ts-node --type-check src/index.ts'

    // Fix ts-node-dev error
    pkgFile.scripts['start:dev'] = 'ts-node --type-check src/index.ts'

    const extraDependencies = this.readExtraDependencies()
    delete pkgFile.dependencies.warthog

    pkgFile.dependencies = {
      // this should overwrite warthog dep as well
      ...pkgFile.dependencies,
      ...extraDependencies,
    }

    debug(`Writing package.json: ${JSON.stringify(pkgFile, null, 2)}`)

    fs.writeFileSync('package.json', JSON.stringify(pkgFile, null, 2))
  }

  readExtraDependencies(): Record<string, string> {
    const hydraCliPkgJson = resolveHydraCliPkgJson()

    const queryNodeDeps = (hydraCliPkgJson.queryNodeDependencies ||
      {}) as Record<string, string>

    const hydraCliDeps = (hydraCliPkgJson.dependencies || {}) as Record<
      string,
      string
    >

    // overwrite with hydra-cli own dependency if present
    Object.keys(queryNodeDeps).forEach((dep) => {
      if (hydraCliDeps[dep]) {
        debug(`Rewriting the dependency ${dep} to ${hydraCliDeps[dep]}`)
        queryNodeDeps[dep] = hydraCliDeps[dep]
      }
    })

    return queryNodeDeps
  }

  async createDB(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await warthogCliRun(['db:create'])
  }

  /**
   * Generate the warthog source files:
   *   - model/resolver/service for entities
   *   - Fulltext search queries (migration/resolver/service)
   */
  generateWarthogSources(): void {
    const modelBuilder = new WarthogModelBuilder(this.schemaResolvedPath)
    const model = modelBuilder.buildWarthogModel()

    const sourcesGenerator = new SourcesGenerator(model)
    sourcesGenerator.generate()
  }

  async codegen(): Promise<void> {
    const { stderr } = await execa('yarn', ['warthog', 'codegen'])
    parseWarthogCodegenStderr(stderr)
    if (this.prod) await execa('yarn', ['dotenv:generate'])
  }

  async syncSchema(): Promise<void> {
    await execa('yarn', ['db:sync'])
  }

  async runMigrations(): Promise<void> {
    debug('performing migrations')
    await execa('yarn', ['db:migrate'])
  }

  async updateDotenv(): Promise<void> {
    // copy dotnenvi env.yml file
    debug('Creating graphql-server/env.yml')
    await fs.copyFile(
      getTemplatePath('graphql-server/warthog.env.yml'),
      path.resolve(process.cwd(), 'env.yml')
    )
    const envConfig = dotenv.parse(fs.readFileSync('.env'))

    // Override DB_NAME, PORT, ...
    envConfig.WARTHOG_DB_DATABASE =
      process.env.DB_NAME || envConfig.WARTHOG_DB_DATABASE
    envConfig.WARTHOG_DB_USERNAME =
      process.env.DB_USER || envConfig.WARTHOG_DB_USERNAME
    envConfig.WARTHOG_DB_PASSWORD =
      process.env.DB_PASS || envConfig.WARTHOG_DB_PASSWORD
    envConfig.WARTHOG_DB_HOST = process.env.DB_HOST || envConfig.WARTHOG_DB_HOST
    envConfig.WARTHOG_DB_PORT = process.env.DB_PORT || envConfig.WARTHOG_DB_PORT
    envConfig.WARTHOG_APP_PORT =
      process.env.GRAPHQL_SERVER_PORT || envConfig.WARTHOG_APP_PORT
    envConfig.WARTHOG_APP_HOST =
      process.env.GRAPHQL_SERVER_HOST || envConfig.WARTHOG_APP_HOST
    envConfig.WARTHOG_MODULE_IMPORT_PATH =
      process.env.MODULE_IMPORT_PATH || '@joystream/warthog'

    const newEnvConfig = Object.keys(envConfig)
      .map((key) => `${key}=${envConfig[key]}`)
      .join('\n')
    await fs.writeFile('.env', newEnvConfig)
  }
}
