import * as fs from 'fs-extra'
import * as path from 'path'
import * as dotenv from 'dotenv'

import Command from '@oclif/command'
import { run } from 'warthog/dist/cli/cli'

import { WarthogModelBuilder } from './../parse/WarthogModelBuilder'
import { getTemplatePath } from '../utils/utils'
import Debug from 'debug'
import { SourcesGenerator } from '../generate/SourcesGenerator'
import execa = require('execa')
import Listr = require('listr')

const FALLBACK_WARTHOG_LIB =
  'https://github.com/metmirr/warthog/releases/download/v2.19/warthog-v2.19.tgz'

const debug = Debug('qnode-cli:warthog-wrapper')

export default class WarthogWrapper {
  private readonly command: Command
  private readonly schemaPath: string
  private readonly schemaResolvedPath: string

  private flags: Record<string, boolean | string> = {}

  constructor(command: Command, schemaPath: string) {
    this.command = command
    this.schemaPath = schemaPath
    this.schemaResolvedPath = path.resolve(process.cwd(), this.schemaPath)
    if (!fs.existsSync(this.schemaResolvedPath)) {
      throw new Error(
        `Cannot open the schema file ${this.schemaResolvedPath}. Check if it exists.`
      )
    }
  }

  async run(flags: Record<string, boolean | string> = {}): Promise<void> {
    // Order of calling functions is important!!!
    this.flags = flags
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
        title: 'Install dependencies',
        skip: () => {
          if (this.flags.install !== true) {
            return 'Skipping: either --no-install flag has been passed or the HYDRA_NO_DEPS_INSTALL environment variable is set to'
          }
        },
        task: async () => {
          await this.installDependecies()
        },
      },
      {
        title: 'Generate server sources',
        skip: () => {
          if (this.flags.install !== true) {
            return 'Skipping: dependencies are not installed'
          }
        },
        task: () => {
          this.generateWarthogSources()
        },
      },
      {
        title: 'Warthog codegen',
        skip: () => {
          if (this.flags.install !== true) {
            return 'Skipping: dependencies are not installed'
          }
        },
        task: async () => {
          await this.codegen()
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
        title: 'Generate migrations',
        task: async () => {
          await this.createMigrations()
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

  async generateAPIPreview(): Promise<void> {
    // Order of calling functions is important!!!
    await this.newProject()
    this.prepareProjectFiles()
    await this.installDependecies()
    this.generateWarthogSources()
    await this.codegen()
  }

  async newProject(projectName = 'query_node'): Promise<void> {
    const consoleFn = console.log
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.log = () => {}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await run(['new', `${projectName}`])
    console.log = consoleFn

    // Override warthog's index.ts file for custom naming strategy
    fs.copyFileSync(
      getTemplatePath('graphql-server.index.mst'),
      path.resolve(process.cwd(), 'src/index.ts')
    )
    fs.copyFileSync(
      getTemplatePath(`graphql-server.tsconfig.json`),
      path.resolve(process.cwd(), 'tsconfig.json')
    )

    await this.updateDotenv()
  }

  prepareProjectFiles(): void {
    if (!fs.existsSync('package.json')) {
      this.command.error(
        'Could not find package.json file in the current working directory'
      )
    }

    const pkgFile = JSON.parse(
      fs.readFileSync('package.json', 'utf8')
    ) as Record<string, Record<string, unknown>>
    pkgFile.scripts['db:sync'] =
      'SYNC=true WARTHOG_DB_SYNCHRONIZE=true ts-node --type-check src/index.ts'

    // Fix ts-node-dev error
    pkgFile.scripts['start:dev'] = 'ts-node --type-check src/index.ts'

    // Node does not run the compiled code, so we use ts-node in production...
    pkgFile.scripts['start:prod'] =
      'WARTHOG_ENV=production yarn dotenv:generate && ts-node src/index.ts'
    pkgFile.dependencies.warthog = this.getWarthogDependency()
    fs.writeFileSync('package.json', JSON.stringify(pkgFile, null, 2))
  }

  async installDependecies(): Promise<void> {
    debug('Installing the dependencies')
    await execa('yarn', ['add', 'lodash']) // add lodash dep
    await execa('yarn', ['install'])
  }

  async createDB(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await run(['db:create'])
  }

  getWarthogDependency(): string {
    /* eslint-disable */
    const warthogPackageJson = require('warthog/package.json') as Record<string, unknown>;
    debug(`Warthog package json: ${JSON.stringify(warthogPackageJson, null, 2)}`);
    // if there is a special 'hydra' property, use it as depenency, otherwise use hardcoded fallback
    return (warthogPackageJson.hydra || FALLBACK_WARTHOG_LIB) as string;
  }

  /**
   * Generate the warthog source files:
   *   - model/resolver/service for entities
   *   - Fulltext search queries (migration/resolver/service)
   */
  generateWarthogSources(): void {
    const modelBuilder = new WarthogModelBuilder(this.schemaResolvedPath);
    const model = modelBuilder.buildWarthogModel();

    const sourcesGenerator = new SourcesGenerator(model);
    sourcesGenerator.generate();
  }

  async codegen(): Promise<void> {
    await execa('yarn', ['warthog', 'codegen']);
    await execa('yarn', ['dotenv:generate']);
  }

  async createMigrations(): Promise<void> {
    await execa('yarn', ['db:sync']);
  }

  async runMigrations(): Promise<void> {
    debug('performing migrations');
    await execa('yarn', ['db:migrate']);
  }

  async updateDotenv(): Promise<void> {
    // copy dotnenvi env.yml file
    debug('Creating graphql-server/env.yml');
    await fs.copyFile(getTemplatePath('warthog.env.yml'), path.resolve(process.cwd(), 'env.yml'));
    const envConfig = dotenv.parse(fs.readFileSync('.env'));

    // Override DB_NAME, PORT, ...
    envConfig['WARTHOG_DB_DATABASE'] = process.env.DB_NAME || envConfig['WARTHOG_DB_DATABASE'];
    envConfig['WARTHOG_DB_USERNAME'] = process.env.DB_USER || envConfig['WARTHOG_DB_USERNAME'];
    envConfig['WARTHOG_DB_PASSWORD'] = process.env.DB_PASS || envConfig['WARTHOG_DB_PASSWORD'];
    envConfig['WARTHOG_DB_HOST'] = process.env.DB_HOST || envConfig['WARTHOG_DB_HOST'];
    envConfig['WARTHOG_DB_PORT'] = process.env.DB_PORT || envConfig['WARTHOG_DB_PORT'];
    envConfig['WARTHOG_APP_PORT'] = process.env.GRAPHQL_SERVER_PORT || envConfig['WARTHOG_APP_PORT'];
    envConfig['WARTHOG_APP_HOST'] = process.env.GRAPHQL_SERVER_HOST || envConfig['WARTHOG_APP_HOST'];

    const newEnvConfig = Object.keys(envConfig)
      .map(key => `${key}=${envConfig[key]}`)
      .join('\n');
    await fs.writeFile('.env', newEnvConfig);
  }
}
