import { Command, flags } from '@oclif/command';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as utils from './../utils/utils';
import cli from 'cli-ux';
import { getTemplatePath } from '../utils/utils';
import Mustache = require('mustache');
import dotenv = require('dotenv');
import execa = require('execa');
import glob = require('glob');

const DEFAULT_WS_API_ENDPOINT = 'wss://kusama-rpc.polkadot.io/';
const DEFAULT_KUSAMA_INDEXER = 'https://kusama-indexer.joystream.app/graphql';

export default class Scaffold extends Command {
  static description = `Starter kit: generates a directory layout and a sample schema file`;

  static flags = {
    projectName: flags.string({ char: 'n', description: 'Project name' }),
    wsProviderUrl: flags.string({
      char: 'w',
      description: 'Substrate WS provider endpoint',
      default: DEFAULT_WS_API_ENDPOINT,
    }),
    // pass --no-mappings to skip default mappings and schema
    mappings: flags.boolean({ char: 'm', allowNo: true, description: 'Create schema and mappings', default: true }),
    blockHeight: flags.string({ char: 'b', description: 'Start block height', default: '0' }),
    dbHost: flags.string({ char: 'h', description: 'Database host', default: 'localhost' }),
    dbPort: flags.string({ char: 'p', description: 'Database port', default: '5432' }),
    dbUser: flags.string({ char: 'u', description: 'Database user', default: 'postgres' }),
    dbPassword: flags.string({ char: 'x', description: 'Database user password', default: 'postgres' }),
    appPort: flags.string({ char: 'a', description: 'GraphQL server port', default: '4000' }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Scaffold);

    await fs.writeFile(
      path.join(process.cwd(), '.env'),
      flags.projectName ? await this.dotenvFromFlags(flags) : await this.promptDotEnv()
    );

    dotenv.config();

    this.log('Your settings have been saved to .env, feel free to edit');

    cli.action.start('Scaffolding');

    if (flags.mappings) {
      await this.setupMappings();
    }

    await this.setupNodeProject();
    await this.setupDocker();

    cli.action.stop();
  }

  async dotenvFromFlags(flags: { [key: string]: string | boolean | undefined }): Promise<string> {
    const template = await fs.readFile(getTemplatePath('scaffold/.env'), 'utf-8');
    return Mustache.render(template, { ...flags, dbName: flags.projectName });
  }

  async promptDotEnv(): Promise<string> {
    let ctx: Record<string, string> = {};

    const projectName = (await cli.prompt('Enter your project name', { required: true })) as string;
    ctx = { ...ctx, projectName };

    ctx = { ...ctx, ...(await this.promptIndexerEnvs(ctx)) };
    ctx = { ...ctx, ...(await this.promptProcessorEnvs(ctx)) };

    const dbName = (await cli.prompt('Database name', { default: projectName })) as string;
    ctx = { ...ctx, dbName };
    const dbHost = (await cli.prompt('Database host', { default: 'localhost' })) as string;
    ctx = { ...ctx, dbHost };
    const dbPort = (await cli.prompt('Database port', { default: '5432' })) as string;
    ctx = { ...ctx, dbPort };
    const dbUser = (await cli.prompt('Database user', { default: 'postgres' })) as string;
    ctx = { ...ctx, dbUser };
    const dbPassword = (await cli.prompt('Database user password', { type: 'mask', default: 'postgres' })) as string;
    ctx = { ...ctx, dbPassword };

    const template = await fs.readFile(getTemplatePath('scaffold/.env'), 'utf-8');

    return Mustache.render(template, ctx);
  }

  async promptProcessorEnvs(ctx: Record<string, string>): Promise<Record<string, string>> {
    const proceed = await cli.confirm('Are you going to run an mappings processor?');
    if (!proceed) {
      return ctx;
    }
    const indexerUrl = (await cli.prompt('Provide an indexer GraphQL API endpoint to source events from', {
      default: DEFAULT_KUSAMA_INDEXER,
    })) as string;
    ctx = { ...ctx, indexerUrl };

    const appPort = (await cli.prompt('Processor GraphQL server port', { default: '4000' })) as string;
    ctx = { ...ctx, appPort };

    return ctx;
  }

  async promptIndexerEnvs(ctx: Record<string, string>): Promise<Record<string, string>> {
    const proceed = await cli.confirm('Are you going to run an indexer?');
    if (!proceed) {
      return ctx;
    }
    ctx = { ...ctx };
    const wsProviderUrl = (await cli.prompt('Substrate WS provider endpoint', {
      default: DEFAULT_WS_API_ENDPOINT,
    })) as string;

    ctx = { ...ctx, wsProviderUrl };

    const blockHeight = (await cli.prompt('What is the block height the indexer should start from?', {
      default: '0',
    })) as string;
    if (isNaN(parseInt(blockHeight))) {
      throw new Error('Starting block height must be an integer');
    }
    ctx = { ...ctx, blockHeight };

    const redisUri = (await cli.prompt('Please provide a Redis instance connection string', {
      default: 'redis://localhost:6379/0',
    })) as string;
    ctx = { ...ctx, redisUri };

    ctx = await this.promptCustomTypes(ctx);

    return ctx;
  }

  async promptCustomTypes(ctx: Record<string, string>): Promise<Record<string, string>> {
    const proceed = await cli.confirm('Are there any non-standard types or modules in the substrate runtime?');
    if (!proceed) {
      return ctx;
    }
    const typesJSON = (await cli.prompt(
      'Please provide the localtion of the type definitions JSON, relative to ./generated/indexer',
      { default: '../../typedefs.json' }
    )) as string;
    return { ...ctx, typesJSON };
  }

  // For now, we simply copy the hardcoded templates from the mappings dir
  async setupMappings(): Promise<void> {
    await utils.copyTemplateToCWD('scaffold/schema.graphql', 'schema.graphql');

    await fs.ensureDir('mappings');
    const mappingFiles = glob.sync(path.join(__dirname, '..', '/templates/scaffold/mappings/**/*.ts'));
    // TODO: make this generic and move to utils
    for (const f of mappingFiles) {
      const pathParts = f.split(path.sep);
      // remove the trailing parts of the path up to ./scaffold
      let topDir = pathParts.shift();
      while (topDir !== 'scaffold') {
        topDir = pathParts.shift();
      }
      const targetDir = path.join(...pathParts);

      await utils.copyTemplateToCWD(path.join('scaffold', targetDir), targetDir);
    }
  }

  async setupDocker(): Promise<void> {
    await fs.ensureDir('docker');
    await utils.copyTemplateToCWD('scaffold/docker-compose.yml', 'docker-compose.yml');

    await utils.copyTemplateToCWD('scaffold/docker/Dockerfile.hydra', path.join('docker', 'Dockerfile.hydra'));

    await utils.copyTemplateToCWD('scaffold/.dockerignore', '.dockerignore');
  }

  async setupNodeProject(): Promise<void> {
    const template = await fs.readFile(getTemplatePath('scaffold/package.json'), 'utf-8');

    await fs.writeFile(
      path.join(process.cwd(), 'package.json'),
      Mustache.render(template, {
        projectName: process.env.PROJECT_NAME,
      })
    );

    await execa('yarn', ['install']);
  }
}
