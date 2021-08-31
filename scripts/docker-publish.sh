#!/bin/bash


for p in "$@"; do
    target="${p#hydra-}"
    version=$(cd "packages/$p" && node -p "require('./package.json').version")
    major=$(echo $version | cut -d '.' -f1)

    docker build . --target "$target" \
        -t subsquid/${p}:${version} \
        -t subsquid/${p}:${major} \
        -t subsquid/${p}:${release:-next} || exit 1

    docker push subsquid/${p} --all-tags || exit 1
done
