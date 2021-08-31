
export PATH="$(pwd)/node_modules/.bin:$PATH"

set -e
cd "$1"
oclif-dev readme
sed '/_See code/d' README.md > README.temp
mv README.temp README.md