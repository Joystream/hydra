# Hydra

The repo contains the following sub-packages:

* Hydra [CLI tool](substrate-query-framework/cli/)
* Hydra [Indexer](/substrate-query-framework/index-builder/)
* Event [mappings](joystream-query-node/) for the Joystream chain
* Hydra [docs](docs/)

### Bird-eye overview

Hydra has two principal components: Hydra Indexer and Hydra Processor.  Hydra Indexer ingests raw data from a substrate chain. Hydra Processor is responsible for transforming the raw data into domain-level entities as defined in `schema.graphl` and  the event handlers, both provided by the user. `hydra-cli` provides additional scaffolding and codegen tooling for running and developing a Hydra Processor tailored for the provided schema file.

![Hydra Indexer \(top\) and Hydra Processor \(bottom\) data flows](.gitbook/assets/hydra-diagram.png)

