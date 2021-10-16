const fs = require('fs')

function patch(dependencies) {
  for (const name in dependencies) {
    if (name != '@subsquid/openreader' && name.startsWith('@subsquid/')) {
      const dep = name.slice('@subsquid/'.length)
      dependencies[name] = `/${dep}.tgz`
    }
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
patch(pkg.dependencies)
patch(pkg.devDependencies)
fs.writeFileSync('package.json', JSON.stringify(pkg, undefined, 2))