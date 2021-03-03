const { readdirSync, statSync } = require('fs')
const { join } = require('path')

const packages = readdirSync('packages').filter(f => statSync(join('packages', f)).isDirectory())

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    "scope-enum": [1, "always", packages]
  }
}