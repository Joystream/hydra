import * as path from 'path';
import * as fs from 'fs-extra';
import * as dotenv from 'dotenv';
import * as Mustache from 'mustache';
import { readFileSync } from 'fs-extra';
import { Command, flags } from '@oclif/command';

import cli from 'cli-ux';
import Debug from 'debug';

import { createDir, getTemplatePath, createFile, resolvePackageVersion } from '../utils/utils';
import { formatWithPrettier } from '../helpers/formatter';
import WarthogWrapper from '../helpers/WarthogWrapper';
import { getTypeormConfig } from '../helpers/db';
import { kebabCase, upperFirst } from '../generate/utils';
import execa = require('execa');
import Listr = require('listr');

const debug = Debug('qnode-cli:codegen');

export default class Codegen extends Command {
  static description = 'Code generator';
  static generatedFolderName = 'generated';

  static flags = {
    schema: flags.string({ char: 's', description: 'Schema path', default: '../../schema.graphql' }),
    // pass --no-indexer to skip indexer generation
    processor: flags.boolean({ char: 'i', allowNo: true, description: 'Generate Hydra Processor', default: true }),
    // pass --no-graphql to skip graphql generation
    graphql: flags.boolean({ char: 'g', allowNo: true, description: 'Generate GraphQL server', default: true }),

    dbschema: flags.boolean({ char: 'd', description: 'Create the DB schema (use with caution!)', default: false }),
    // pass --no-install to skip the `yarn install` steps
    install: flags.boolean({ allowNo: true, description: 'Install dependencies', default: true }),
  };

  private parsedFlags!: Record<string, boolean | string>;

  async run(): Promise<void> {
    dotenv.config();

    const { flags } = this.parse(Codegen);
    this.parsedFlags = flags;
    this.parsedFlags.install = this.parsedFlags.install && process.env.HYDRA_NO_DEPS_INSTALL !== 'true';
    debug(`Parsed flags: ${JSON.stringify(this.parsedFlags, null, 2)}`);
    const generatedFolderPath = path.resolve(process.cwd(), Codegen.generatedFolderName);

    createDir(generatedFolderPath);

    // Change directory to generated
    process.chdir(generatedFolderPath);

    // Create warthog graphql server
    if (flags.graphql) {
      cli.action.start('Generating the GraphQL server');
      await this.createGraphQLServer(flags.schema, flags.dbschema);
      cli.action.stop();
    }

    // Create Hydra processor
    if (flags.processor) {
      cli.action.start('Generating Hydra Processor');
      await this.createProcessor();
      cli.action.stop();
    }
  }

  async createGraphQLServer(schemaPath: string, syncdb: boolean): Promise<void> {
    const goBackDir = process.cwd();

    const warthogProjectName = 'graphql-server';
    const warthogProjectPath = path.resolve(goBackDir, warthogProjectName);

    createDir(warthogProjectPath);

    process.chdir(warthogProjectPath);

    const warthogWrapper = new WarthogWrapper(this, schemaPath);
    await warthogWrapper.run(this.parsedFlags);

    if (syncdb) {
      await warthogWrapper.generateDB();
    }

    process.chdir(goBackDir);
  }

  async createProcessor(): Promise<void> {
    // Take process where back at the end of the function execution
    const goBackDir = process.cwd();

    // Block indexer folder path
    const indexerPath = path.resolve(goBackDir, 'hydra-processor');

    createDir(indexerPath);
    process.chdir(indexerPath);

    const generateFiles = {
      title: 'Generate source files',
      task: async () => {
        let indexFileContent = readFileSync(getTemplatePath('index-builder-entry.mst'), 'utf8');
        indexFileContent = Mustache.render(indexFileContent, {
          projectName: upperFirst(process.env.PROJECT_NAME),
        });
        createFile(path.resolve('index.ts'), formatWithPrettier(indexFileContent));

        let pkgJsonContent = readFileSync(getTemplatePath('indexer.package.json'), 'utf8');
        pkgJsonContent = Mustache.render(pkgJsonContent, {
          hydraCommon: resolvePackageVersion('@dzlzv/hydra-common'),
          hydraDbUtils: resolvePackageVersion('@dzlzv/hydra-db-utils'),
          hydraProcessor: resolvePackageVersion('@dzlzv/hydra-processor'),
          pkgName: kebabCase(process.env.PROJECT_NAME),
          projectName: upperFirst(process.env.PROJECT_NAME),
        });
        createFile(path.resolve('package.json'), formatWithPrettier(pkgJsonContent, { parser: 'json' }));

        // Create .env file for typeorm database connection
        await fs.writeFile('.env', getTypeormConfig());

        // Create
        await fs.copyFile(getTemplatePath('indexer.tsconfig.json'), path.resolve(process.cwd(), 'tsconfig.json'));
      },
    };
    // Create index.ts file

    const installDeps = {
      title: 'Install dependencies for Hydra Processor',
      skip: () => {
        if (this.parsedFlags.install !== true) {
          return 'Skipping: either --no-install flag has been passed or the HYDRA_NO_DEPS_INSTALL environment variable is set to';
        }
      },
      task: async () => {
        await execa('yarn', ['install']);
      },
    };

    const listr = new Listr([generateFiles, installDeps]);
    await listr.run();

    process.chdir(goBackDir);
  }
}
