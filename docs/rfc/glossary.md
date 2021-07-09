# Glossary

## Mapping

A mapping is an event handler. It is a typescript function triggered by Hydra processor when the event is being processed.

## Mapping Script

Mapping script is the module where all the mapping functions are exported. Typically, it's located in `mappings/index.ts` and contain only exports of the mappings.

## Virtual event

Hydra fetches runtime [events](https://substrate.dev/docs/en/knowledgebase/runtime/events) and [extrinsics](https://substrate.dev/docs/en/knowledgebase/runtime/execution#executing-extrinsics) from the chain and places them into a processing queue as emitted by the chain. The mappings (i.e. event/extrinsic handlers) may emit additional events internal to Hydra. Since these events don't come from the Substrate runtime, they are called virtual. 