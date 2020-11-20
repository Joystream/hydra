# Virtual events

## Summary

Virtual events are similar to chain events but emitted by the processor itself. This allows to significantly extend the scope and potential use-cases for the mappings.

## Goals and motivation

There are multiple cases where relying only on the data provided by substrate events is not feasible.

1) The extrinsic does not throw a relevant event to capture the data, e.g. during a `sudoAs` or `batchCall`.
Example: The project RMRK relies on `system.remark` calls. There is no specific event that'd efficiently capture the required data.

2) The event data requires additional transformation before it can be processed. For example, EVM runtime module would only emit `Log` events with low-level data. An intermediary extrinsic handler would listen to such low-level extrinsic calls, decode the data end emit virtual events with strongly typed data. The goal here is to make seamless migration of the graph mappings used for Ethereum to smart contracts deployed on Moonbeam or EVM palette.

3) Allow reusable extrinsic handlers and events imported from external public libraries.

4) At the first step, only extrinsicHandlers are allowed to emit virtual events. A logical extension would be to allow event handlers to emit
virtual events as well, thus making it possible to have complex pipelines of arbitrary complexity.

## Urgency

Unless no other alternatives are suggested, this is needed to go forward with mappings for EVM smart contracts.

## Detailed design

Virtual events are placed in the processing queue straight after the `ExtrinsicSuccess` event and before the next chain event.

For now, virtual events can be emitted only by extrinsic handlers. The virtual events emitted by the extrinsic handlers should be explicitly defined in the manifest file:

```yml
...
eventHandlers:
  - event: remarkCreated(RemarkData)
    handler: handleRemarkCreated
    virtual: true
extrinsicHandlers:
  - extrinsic: system.remark(remark: Bytes)
    handler: handleRemarks
    emits:
        - remarkCreated(RemarkData)
    exports:
        - RemarkData
```

The handler will like this

```typescript

// mappings/handleRemarkCreated.ts
import { RemarkData } from './handleRemarkCreated'

export handleRemarkCreated(remarkData: RemarkData) {
   // some business logic with remarkData
}

// mappings/handleRemarks.ts

import { emit, EventData } from '@dzlzv/hydra-processor'
import { RemarkExtrinsic } from './generated/RemarkExtrinsic'

// some custom interface to be emitted along with the data
export interface RemarkData extends EventData {
   name: String;
   url: String;
}

export handleBatchCalls(extrinsic: RemarkExtrinsic) {
   const data: Bytes = extrinsic.args._remark
   // parse and transform the raw data
   const remarkData = parse(...)
   emit('remarkCreated', remarkData)
}

/// Auto-generated in ./generared/RemarkExtrinsic

// typeRegistry is declared there but must be defined elsewhere
import { typeRegistry, SubtrateExtrinsic } from '@dzlzv/hydra-common'
// types.ts must reexport these types from @polkadot/api/intefaces
import { Bytes } from '../types'

export class RemarkExtrinsic extends SubstrateExtrinsic {
    get args(): RemarkExtrinsic__Args {
        return new RemarkExtrinsic__Args(this)
    }  
}

export class RemarkExtrinsic__Args {
  _extrinsic: SubstrateExtrinsic;

  constructor(extrinsic: SubstrateExtrinsic) {
    this._extrinsic = extrinsic;
  }
  
  get _remark(): Bytes {
    return typeRegistry.createType('Bytes', this._extrinsic.args[0].value)
  }

}

```

## Compatibility

Not compatible with the previous Hydra versions.
