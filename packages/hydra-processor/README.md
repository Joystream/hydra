# Hydra processor

Hydra processor is a client-side 'sink' tool used to fetch substrate events from a Hydra indexer.
It sequentially applies the event handlers one by one in the order the events have been emitted.

It is not meant to be run directly, but rather using [Hydra CLI](./../hydra-cli/README.md)
