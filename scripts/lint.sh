#!/bin/bash

export PATH="$(pwd)/node_modules/.bin:$PATH"

ARGS=("$@")

lint() {
  echo "LINT $1"
  (cd "$1" && eslint . --cache --ext .ts "${@:2}" "${ARGS[@]}")
}

set -e

for pkg in packages/*; do
  case "$pkg" in
    packages/hydra-indexer-gateway | packages/warthog)
      # skip
      ;;
    packages/hydra-e2e-tests)
      lint "$pkg" --config .eslintrc.js
      ;;
    *)
      lint "$pkg"
      ;;
  esac
done