import * as path from 'path'
import * as version from './utils/version'
import { OutDir } from './utils/outDir'
import { randomInteger, render } from './utils/utils'

export interface ScaffoldOptions {
  targetDir: string
  withServer?: boolean
  withServerExtension?: boolean
}

export function scaffold(options: ScaffoldOptions): void {
  const dst = path.resolve(options.targetDir)
  const dir = new OutDir(dst)

  const env = {
    projectName: path.basename(dst),
    graphqlPort: randomInteger(4000, 4999),
    dbPort: randomInteger(5000, 6000),
    indexerPort: randomInteger(6001, 7000),
  }

  {
    const pkg: any = {}
    pkg.name = env.projectName
    pkg.private = true
    pkg.scripts = {
      typegen: 'hydra-typegen typegen manifest.yml',
      codegen: 'hydra-cli codegen',
      build: 'tsc',
      'db:create': 'hydra-cli db:create',
      'db:drop': 'hydra-cli db:drop',
      'db:create-migration': 'hydra-cli db:create-migration',
      'db:migrate': 'hydra-cli db:migrate',
      'db:revert': 'hydra-cli db:revert',
      'db:reset':
        'hydra-cli db:drop && hydra-cli db:create && hydra-processor migrate && hydra-cli db:migrate',
      'processor:migrate': 'hydra-processor migrate',
      'processor:start': 'hydra-processor run',
      'query-node:start': 'node ./lib/generated/server.js',
    }
    pkg.dependencies = {}
    pkg.devDependencies = {}
    pkg.dependencies['@polkadot/types'] = version.polkadot
    if (options.withServer) {
      pkg.dependencies['@subsquid/openreader'] = version.openreader
    }
    pkg.dependencies['@subsquid/hydra-common'] = version.hydra
    pkg.dependencies['@subsquid/hydra-processor'] = version.hydra
    pkg.dependencies.inflected = version.inflected
    if (options.withServer && options.withServerExtension) {
      pkg.dependencies['class-validator'] = version.classValidator
      pkg.dependencies['type-graphql'] = version.typeGraphql
    }
    pkg.dependencies.typeorm = version.typeorm
    pkg.devDependencies['@subsquid/hydra-cli'] = version.hydra
    pkg.devDependencies['@subsquid/hydra-typegen'] = version.hydra
    pkg.devDependencies['@types/inflected'] = version.inflectedTypes
    pkg.devDependencies['@types/pg'] = version.pgTypes
    pkg.devDependencies.typescript = version.typeScript
    dir.write('package.json', JSON.stringify(pkg, undefined, 2))
  }

  dir.addResource('scaffold/manifest.yml', 'manifest.yml')
  dir.addResource('scaffold/tsconfig.json', 'tsconfig.json')
  dir.addResource('scaffold/docker-compose.yml', 'docker-compose.yml')
  dir.addResource('scaffold/src/mappings/index.ts', 'src/mappings/index.ts')
  dir.write('schema.graphql', '\n')
  dir.write('.env', render('scaffold/.env', env))
  dir.write(
    'indexer/docker-compose.yml',
    render('scaffold/indexer/docker-compose.yml', env)
  )
}
