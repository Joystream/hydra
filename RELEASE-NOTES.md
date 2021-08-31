# Release Notes

This document outlines new features introduced in major Hydra releases and outlines migration steps. For more details see [CHANGELOG](./CHANGELOG.md)

## v4  

The focus of Hydra v4 release is on improving the overall dev UX and performance. Hydra projects now enjoy a flat and intuitive structure as seen in [hydra template project](https://github.com/subsquid/hydra-template).

It is now possible to extend the generated queries by adding custom models and query resolvers to `server-extension` folder in the project root.

Migration from v3 is straightforward: clone [hydra-template](https://github.com/subsquid/hydra-template) and drop in your schema and mappings to the corresponding locations. Then follow the steps in README.md, and all is set.

Other notable features:

- Native TS support for mappings. No time wasted on transpiling

- Optimized and more performant Indexer and Indexer Gateways. Data fetching is up to 10x faster

- More resilient data fetching by the processor

- Generated query node performance improvements and bugfixes: JSON entity fields, pagination, entity Relations filtering
