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

A full sample Hydra project can be found [here](./../sample/README.md)

## Usage

For usage and a list of supported flags, type

```bash
hydra-typegen typegen --help
```

A minimal example for generating classes for the `Balances.Transfer` and `Treasury.Deposit` events in Kusama:

```bash
hydra-typegen --metadata wss://kusama-rpc.polkadot.io Balances.Transfer,Treasury.Deposit
```

## Custom types

Hydra Typegen supports custom substrate types via the `--typedefs` flag. The provided `.json` file should include type definitions
for the arguments and parameters of the events and extrinsics to be generated. The type definitions file is copied to the generated sources.
