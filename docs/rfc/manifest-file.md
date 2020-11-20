# Manifest file for Hydra processor

## Summary

The Manifest file is a high-level `.yml` file which describes _how_ and _what_ the Hydra processor has to run. The manifest file + the mappings should the sufficient for running the processor from a clean state. It should replace the root `.env` presently used as a config file.

## Goals and motivation

1) We need a more structured and clear way to configure the processor

2) As the complexity of the processor grows, a descriptive config with nested properties is required

3) Smoother transition for The Graph users

## Urgency

As we add more features to the processor, we need a unified high-level definition of how the processor should apply the handlers.

## Detailed Design

### 1.1 Top-Level API

Similar to TheGraph design

| Field  | Type | Description   |
| --- | --- | --- |
| **specVersion** | *String*   | A Semver version indicating which version of this API is being used.|
| **schema**   | [*Schema*](#12-schema) | The GraphQL schema of this subgraph.|
| **description**   | *String* | An optional description of the subgraph's purpose. |
| **repository**   | *String* | An optional link to where the subgraph lives. |
| **dataSources**| [*Data Source Spec*](#13-data-source)| Each data source spec defines the data that will be ingested as well as the transformation logic to derive the state of the subgraph's entities based on the source data.|

### 1.2 Schema

| Field | Type | Description |
| --- | --- | --- |
| **file**| [*Path*](#16-path) | The path of the GraphQL IDL file (no IPFS support for now) |

### 1.3 Data Source

| Field | Type | Description |
| --- | --- | --- |
| **kind** | *String* | The type of data source. Possible values: *substrate/runtime* (vs *ethereum/contract* for TheGraph).|
| **name** | *String* | The name of the source data. Will be used to generate APIs in the mapping and also for self-documentation purposes. |
| **network** | *String* | For blockchains, this describes which network the subgraph targets. For example, "kusama" or "joystream/babylon". |
| **source** | [*HydraIndexerSource*](#131-hydraindexersource) | The source data for ingestion. |
| **mapping** | [*Mapping*](#132-mapping) | The transformation logic applied to the data prior to being indexed. |

#### 1.3.1 Hydra Indexer Source

| Field | Type | Description |
| --- | --- | --- |
| **endpoint** | *String* | The endpoint for the Hydra Indexer gateway providing the data. |
| **startBlock** | optional *BigInt* | The block to start processing this data source from. |
| **endBlock** | optional *BigInt* | The block at which the processor stops and exits. |

#### 1.3.2 Mapping

##### 1.3.2.1 Substrate Mapping

| Field | Type | Description |
| --- | --- | --- |
| **kind** | *String* | Must be "substrate/events" for Substrate Events Mapping. |
| **apiVersion** | *String* | Semver string of the version of the Mappings API that will be used by the mapping script. |
| **language** | *String* | The language of the runtime for the Mapping API. For now only *typescript*. |
| **entities** | *[String]* | A list of entities that will be ingested as part of this mapping. Must correspond to names of entities in the GraphQL IDL. |
| **types** | *String* path to a file with definitions | A typescript file exporting the types and interfaces satisfying the event and extrinsic signatures in the handler definitions. Typically, the file reexports the standard polkadot types together with custom files |
| **eventHandlers** | optional *EventHandler* | Handlers for specific events, which will be defined in the mapping script. |
| **extrinsicHandlers** | optional *ExtrinsicHandler* | A list of functions that will trigger a handler on `system.ExtrinsicSuccess` event with the extrinsic data. |
| **blockHandlers** | optional *BlockHandler* | Defines block filters and handlers to process matching blocks. |
| **file** | [*Path*] | The path of the mapping script exporting the mapping functions. |

#### 1.3.2.2 EventHandler

| Field | Type | Description |
| --- | --- | --- |
| **event** | *String* | An identifier for an event that will be handled in the mapping script. It must be in the form `<module>.<method>(type1,type2,...,)` as defined in the metadata file. For example, `balances.DustLost(AccountId,Balance)`. The declared types should be available via globally defined `typeRegistry`. |
| **extrinsic** | optional *String* | The extrinsic that caused the event. If present, only the events emitted by the specified extrinsics will be handled by the handler. Must have a fully qualified name in the form
`<section>.<method>(type1,type2,...,)`|
| **handler** | *String* | The name of an exported function in the mapping script that should handle the specified event. |
| **virtual** | optional *Boolean* | If the event to be handled is _virtual_, that is, emitted by an extrinsic handler or a block handler rather than the runtime |

#### 1.3.2.3 ExtrinsicHandler

| Field | Type | Description |
| --- | --- | --- |
| **function** | *String* | An identifier for a function that will be handled in the mapping script in the form `<section>.<method>(name1: type1, name2: type2,...,)`. Example: `utility.batch(calls: Vec<Call>)`|
| **filter** | optional *String* | An open_CRUD string specifying additional filtering to be applied, i.e. `calls[0].args.max_additional_gt > 10000`. The detailed syntax to be documented elsewhere and is subject to change.  |
| **handler** | *String* | The name of an exported function in the mapping script that should handle the specified event. |
| **emits** | list of *String* | A list of virtual events the handler _may_ emit, in the form ``|

#### 1.3.2.4 BlockHandler

| Field | Type | Description |
| --- | --- | --- |
| **handler** | *String* | The name of an exported function in the mapping script that should handle the specified event. |
| **filter** | optional *String* | The name of the filter that will be applied to decide on which blocks will trigger the mapping. If none is supplied, the handler will be called on every block. The detailed syntax to be documented elsewhere and is subject to change. |

## Compatibility

The changes are not compatible with Hydra v0.
