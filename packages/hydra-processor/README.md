# Hydra processor

Hydra processor is a client tool used to fetch substrate events from a Hydra indexer and sequentially apply the event handlers in the right order. It keeps its state in the database and is resilient against errors and restarts.