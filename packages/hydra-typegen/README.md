# Hydra Typegen

## Motivation

Hydra Typegen is a code generation tool for creating Typescript types for substrate events and extrinsics. Its primary use-case is to provide type-safe interfaces for Hydra mappings. For example, once a typescript class for the  `Balances.Transfer` event is generated, a mapping can look like

```typescript
export async function balancesTransfer(
  db: DatabaseManager,
  _event: SubstrateEvent
) {
  const event = new Balances.TransferEvent(_event);
  const transfer = new Transfer()
  transfer.from = Buffer.from(event.data.accountIds[0].toHex())
  transfer.to = Buffer.from(event.data.accountIds[1].toHex())
  transfer.value = event.data.balance.toBn()
  transfer.block = event.ctx.blockNumber
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`

  console.log(`Saving ${JSON.stringify(transfer, null, 2)}`)

  await db.save<Transfer>(transfer)
}
```

A full sample Hydra project can be found [here](https://github.com/Joystream/hydra/tree/master/packages/sample)

## Usage

For usage and a list of supported flags, type

```bash
hydra-typegen typegen --help
```

A minimal example for generating classes for the `Balances.Transfer` and `Treasury.Deposit` events in Kusama:

```bash
hydra-typegen typegen --metadata wss://kusama-rpc.polkadot.io Balances.Transfer,Treasury.Deposit
```

It is also possible to run `hydra-typegen` against a manifest file:

```bash
hydra-typegen typegen typegen.yml --debug
```

The config file `typegen.yml` can look like this:

```yml
# Typegen will pull the metadata from Kusama at block with the given hash
metadata:
  source: wss://kusama-rpc.polkadot.io
  blockHash: '0x45eb7ddd324361adadd4f8cfafadbfb7e0a26393a70a70e5bee6204fc46af62e'
# events and calls for which the typescript types will be generated
events:
  - Balances.Transfer
calls:
  - Balances.transfer
outDir: ./generated
```

Hydra-typegen also supports config files like the one below:

```yml
metadata:
  source: wss://kusama-rpc.polkadot.io
  blockHash: '0x45eb7ddd324361adadd4f8cfafadbfb7e0a26393a70a70e5bee6204fc46af62e'
events:
  - Balances.Transfer
calls:
  - Balances.transfer
outDir: ./generated
```

Simply run `hydra-typegen <path-to-config-file>`

## Custom types

Hydra Typegen supports custom substrate types via the `--typedefs` flag. The provided `.json` file should include type definitions
for the arguments and parameters of the events and extrinsics to be generated. The type definitions file is copied to the generated sources.

In the config file, place the definition into the `customTypes` section. It assumes that all the custom runtime types are already available for import from a library, so that e.g. the generated import statement

```
import { MyCustomRuntimeClass } from 'my/types/definitions
```

is correctly resolved.

```yml
...
customTypes: 
    lib: <from where the custom types are imported>,
    typedefs: <path to a json file with custom runtime types definitions>,
```