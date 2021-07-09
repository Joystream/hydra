# Layout for the manifest file

- What part of this has to be created by hand vs. created via tooling? In particular all the information about the handlers.

The file layout is going to look like this:

```
generated
|_graphql-server
|_processor
|_types
|___balance.ts // generated type event and extrinsic classes named after each module
|___transfer.ts
|___types.ts // auto-generated interfaces for the events and extrinsic types. More on that below.
mappings
|_index.ts
|_file-with-handlers1.ts
|_file-with-handlers2.ts
|_some-helper-functions.ts
schema.graphql
manifest.yaml
runtime-metadata.json // this file should be manualy extracted from the runtime definition
```

Evetything under `generated` folder is, well, generated. Everything else is written by hand.

- Why does the signature information need to be specified in the handlers? As long as you have a fully specified name (module + module level name), then there can be only one event or extrinsic, as there is no overloading. The full signature should then be available from some external resource (the chain metadata file?) This part seems like it can get really rough to keep in synch with chain if 100% manual.

That's indeed not strictly necessary but I thought it would helpful to have as an additional sanity check. I don't think it's too much of a burden as it can be quickly checked against `runtime-metadata.json`. Provided the error is informative, it's easy to fix. At the same time, it ensures that the mapping developer is "in synch" with the chain.  

- The notion of a `mapping script`, `Mappings API` and `virtual events` are not really defined anywhere, despite being referenced quite a bit. I think some sort of glossary or defintion secton would be a benefit.

See the [glossary](./glossary.md)

- If `EventHandler.virtual` is true, then it appears the described format for `EventHandler.event`. Perhaps there needs to be a distinct `VirtualEventHandler`?

I think it's a good idea to move it into a separate section in the manifest file, namely `virtualHandlers`. The manifest spec is updated.

- If I care about what extrinsic is causing my event, by using the `EventHandler.extrinsic`, then don't I almost certainly need to look at its parameter values as well in my event mapper? In which case isn't this manifest level filtering going to be redundant pre-filtering?

Not 100% sure I understand the question. The main use-case for filtering out extrinsics is when for some reason there is no convenient event to handle in the first place.

One such example is RMRK, based on the `system.remark` extrinsics (like [this](https://kusama.subscan.io/extrinsic/0xcc86342331516adeea5bbe5c83c9d7689d992d10f598500e5bf66edea0c2dbcb)). There handler filter would take only `system.remark` with the `_remark` value starting with `0x726d72`. One can of course process all the remarks and do the filtering inside the mapping, but that's much less efficient.

Another example would be the situation we had with `contentDirecory.transaction` not emitting `transactionFailed`, which would allow to recover the processor database state. Similarly, if some post-processing for (partially) failed `batch` extrinsics are required, we'd need to filter out those that are relevant. Again this can be circumvented by moving the logic into the extrinsic mapping, at the cost of performance overheads.

- My assumption is that if I want to get a Hydra instance going for a given runtime, where the mappings and manifest has been prepared by someone else, then I should not really edit that file. The manifest, as I have understood it, be about coordinating the inherent components of a Subgraph, not about a particular deployment of it. However, this format does not follow that principle, as I need to edit it to change the `Hydra Indexer Source`. If my premise is correct, then not only should the endpoint not be in the manifest, but even the blocks possibly should not, as a particular manifest is really just locked to a runtime or runtime module, which itself could exist in different chains in different block intervals. Ultimately, it depends on what we see the role of the manifest being.

You're probably right. Looking at how we actually deploy the processor, it's more convenient to provide DB settings, indexer URL, start/end blocks via env variables.  

- `dataSources`, along with its description, indicates multiple sources, but the type does not, should the type perhaps be `[DataSource]` or something, signalling a vector?

This is copied from TheGraph manifest.  After some thought I can't really imagine how multiple-source processor may work, even in principle. The fundamental issue is that with multiple sources there is no canonical ordering of the events.

- Why is `entities` actually needed in `Mapping`, is there some benefit to respecifying it here, as the dev will need to keep it in synch with the input file.

Same as with the events signature. It is present in TheGraph manifest, so I initially retained for compatibility. Here I don't think it really adds any value though, so I removed from the manifest as you suggest.

- The `filter` property seems to me to be a risky proposition with unclear upside. By splitting the rule for what extrinsic invocations actually impact processor state across the mapping code and the manifest file, it seems its easy to lose track of what the effective rule is over time.

As discussed above, the main use-case for having a filter is process extrinsics that don't emit good events to handle. In the cases I can come up with these extrinsics are generic or proxy calls (remark, batch, mutlisig, etc). If there is no filtering in the manifest file, I believe it simply leak into the mapping itself, which indeed would make it hard to keep track of how the data is handled.

In general, my reasoning about the manifest file is a follows. It describes _what_ should be passed to the handlers and _when_. The
what part is reflected in the implicit filtering by the event name and the explicit filtering by the extrinsics filter (if provided). The _what_ part also includes the data transformation part powered by the metadata and the generated types, but it is not relevant in the current discussion.

The _when_ part is defined solely by the order in which the events are emmitted by the runtime (including `system.ExtrinsicSuccess` which indicates that the extrinsic handler should be run). Indeed the expected behaviour for the extrinsic handler is to be a pure function which never updates the state but only emits virtual events which in turn processed by the (virtual) event handlers.  

- What is the purpose of `ExtrinsicHandler.exports`?

This is probably needed for codegen purposes. The use-defined types and interfaces used by virtual events can be then imported and re-exported in `./generated/types.ts` similar to the "native" substrate types. If it turns out that there's a better approach, we may drop this property.

- `BlockHandler` probably needs to have an option for whether it runs before or after all other mappings, as this would correspond to `on_initialize` and `on_finalize` in the runtime. The `handler` property description referenes an event, I assume this is a copy&paste error.

Agree, fixed.

# Proposal for generating type-safe mappings for events

- I seem to recall that some feature called `typegen` needed to be part of this to makethings properly automatic, this is what Leszek said, is that still the case here?

I have read Leszek's [thoughts](https://github.com/Joystream/joystream/issues/1816) on how the query node should generate and validate the types, in particular in the context of EVM calls. It is not fully clear to me at the moment, so probably we should get in sync together first.

- This appears to not allow extrinsic only type safe mappings? Why is that? I suspect this to be used 99% of the time, as our current event based approach degenerates into working back into the extrinsic payload. The only reason to process an event is if the side-effect is triggered by an inherent (on_finalized, on_initialized) or it's triggered by multiple extrinsics, and you would like to avoid dealing with them separately, AND (for both cases) the event has sufficient information to compute the full side-effect. This latter constraint is almost never satisfied in our runtime.

- Once we have transactional handlers, I cannot think of a single use case off the top of my head where we want to lock in pairs of extrinsics and events. I also think the example would get really messy with you had lots of pairs like this, you would have `Mod1Extrinsc2BalancesBalancesSetEvent` or something like that to capture combos of different extrinsics causing balance setting. If we do not have this, the example just boils down to what The Graph would have, which would be a single type `Balances.BalanceSetEvent` which would have the layout of current `BalanceSet__Params`.

- I did not understand when we would end up in a situation like `BalanceSet__Params`, where there are no names for params, doesn't the metadata file have names for all extrinsics and events? Seems so https://whisperd.tech/post/substrate_metadata/.

- In the example, the module name for an event is prefixing the name of the type extending `SubstrateEvent`, e.g. `BalancesBalanceSetEvent`. Could we use proper typescript scoping/namespacing to increase readability here, so it would be `Balances.BalanceSetEvent`?

# Virtual events

- I suggest the "Goals and motivations" section only discussed the problem/limitations being addressed in an approach without virtual events. Right now its simultanously describing the problem & solution. A high level description introducing the virtual events high levle "solution" to the stated problems deserves to live in it's own section perhaps.

- Isn't just having transaction handlers an equally suitable solution to the first point in the motivations?

As I described above, my intuition here is that the transaction handlers should be pure functions responsible for either dispatching the virtual events (e.g. after a batch call or EVM modules `Log` event) and/or filtering and/or transforming the incoming data. After some further thought, it may be reasonable to even move some of this logic to the indexer, so that the processor can source virtual events directly from the indexer.

- In the context of EVM support, I sort of interpret these virtual events as our current pre-handlers, with the main difference being that pre-handles directly call what method, while this is lifted out into the manifest file here. Is that correct? I presume the main value-add of this is that you can just grab someone elses virtual event generator off-the shelf, without needing to mess with changing what they call. If this is correct, then it would seem that perhaps virtual event generators should be a distinct kind of extrinsicshandler which is pure, i.e. it does not access the database. Because you really dont want to have to audit exactly what some off-the shelf pre-handler does or does not do.

Yes indeed! A few remarks: as I mentioned, it may make sense to actually make the _indexer_ expose virtrual events in the same way the runtime events are exposed. The main use-case is of course the EVM module, and this would allow the processor clients to tap into the events directly without the need to have a handler on the processor side.

- I don't actually entirely see a smooth way of getting virtual event generators from the outside world and integrating them into my setup. It would seem to require quite a lot of manual stitching, copying, editing of manifest files, etc.
If the virtual event generators change, then you will probably need to do a bit of brittle housekeeping? I assume this can be made smoother.

- If the prior point is correct, then the main new value unlocked is presumably the EVM handling, but for this specific problem I think it seems we are some ways off from the full experience. Lets say I want to write a query node for some new smart contracts. With the virtual events approach it seems I would need to sit down and dig into how to handle extrinsics to the EVM pallet, which is very complex, and I would have to hand-craft types that mirror the different parameters and extrinsics I care about. Once I had all this, I could write my actual handlers for these. At this point, if someone wanted to write another query node for the same smart contract, they could get my event emitters, and map events differently depending on what queries they wanted to support. Given that its often going to be one canonical query set of interest to a given system, the value of the reusability unlocked is relatively low. What I really want to be able to do is what we are thinking I can do in the type safe Substrate case. I want to provide the ABI of my contracts to the codegen tool, and I want to tell it that I care about methods x,y,z, and it gen generate all the required types I want so that I can just jump into writing handlers. In principle the codegen tool could generate virtual event generators, but that is only a technicality at that point.

From the general pov, virtual events are designed for the situation when an extrinsic _should_ emitted a runtime event but doesn't do it for some reason, or does but in an awkward format. When it comes to the EVM handling, there are two main issue:

1) How to make the handlers type-safe (as opposed to consiming `SubstrateEvent` or `EthereumEvent`)

2) How to unwrap the Substrate `Log` event into an EVM event and process in the correct order

The virtual events part is more on how to deal with 2). The idea is that by emitting virtual events in the right format one could make the existing Subgraphs working with Hydra out of the box. The processor will trigger the handlers in the right order.

Again, decoding the EVM log events at the indexer side seems like an alternative/complementary solution, with a clear value for external users not necessary willing to onboard the processing part of Hydra + performace boost due to filtering. There might be a more elegant way to do the "technicality", I am open for suggestions here.

As for the for the former, the question is to how to organize the generated code efficiently and user-friendly on one side, and not overly complex on the other.
