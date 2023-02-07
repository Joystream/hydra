## This is a sample data for block

```
{
  id: '0002608887-a4335',
  hash: '0xa43354da927544d8d0db8ab49aa48035a77cf55213d2f6df39ea729fe353f9d6',
  parentHash: '0xcf5c83590d461c6bad9df6c36549c5bb6955b30213f960c94cbdc4a952a2900a',
  height: 2608887,
  timestamp: 1674784768000,
  runtimeVersion: {
    apis: [
      [Array], [Array], [Array],
      [Array], [Array], [Array],
      [Array], [Array], [Array],
      [Array], [Array], [Array],
      [Array], [Array], [Array]
    ],
    implName: 'root',
    specName: 'root',
    implVersion: 0,
    specVersion: 27,
    authoringVersion: 1,
    transactionVersion: 1
  },
  lastRuntimeUpgrade: {},
  events: [
    {
      id: '0002608887-000000-a4335',
      name: 'system.ExtrinsicSuccess',
      extrinsic: 'timestamp.set'
    },
    {
      id: '0002608887-000001-a4335',
      name: 'assetsExt.InternalWithdraw',
      extrinsic: 'nft.sell'
    },
    {
      id: '0002608887-000002-a4335',
      name: 'nft.FixedPriceSaleList',
      extrinsic: 'nft.sell'
    },
    {
      id: '0002608887-000003-a4335',
      name: 'assetsExt.InternalDeposit',
      extrinsic: 'nft.sell'
    },
    {
      id: '0002608887-000004-a4335',
      name: 'transactionPayment.TransactionFeePaid',
      extrinsic: 'nft.sell'
    },
    {
      id: '0002608887-000005-a4335',
      name: 'system.ExtrinsicSuccess',
      extrinsic: 'nft.sell'
    }
  ],
  extrinsics: [
    { id: '0002608887-000000-a4335', name: 'timestamp.set' },
    { id: '0002608887-000001-a4335', name: 'nft.sell' }
  ]
}
```

## This is the sample data for extrinsic

```
{
  method: 'sell',
  section: 'nft',
  versionInfo: '132',
  signer: '0x2415d15945d81AEF914efBf9BD4D206987d8Fa8A',
  args: [
    { name: 'tokens', type: 'Vec<(u32,u32)>', value: [Array] },
    {
      name: 'buyer',
      type: 'Option<SeedPrimitivesSignatureAccountId20>',
      value: null
    },
    { name: 'paymentAsset', type: 'u32', value: 1 },
    { name: 'fixedPrice', type: 'u128', value: 10 },
    { name: 'duration', type: 'Option<u32>', value: 10080 },
    { name: 'marketplaceId', type: 'Option<u32>', value: 1 }
  ],
  signature: '0xdee34e3dd209953be3c70ab31c3afb13bf314a99816e0bcea60ca67ef45b7ee90b1b3b642e4ed5420df97cb749685812c0e638676a8067f769e81d3fd062d22701',
  hash: '0x6979288f301463fea426fc884987f7e31ea80ded888dae3b2054a595276347d1',
  tip: 0n
}
```

## This is the sample data for event

```
{
  id: '0002608887-000002-a4335',
  name: 'nft.FixedPriceSaleList',
  method: 'FixedPriceSaleList',
  params: [
    { name: 'param0', type: 'Vec<(u32,u32)>', value: [Array] },
    { name: 'param1', type: 'u128', value: 1 },
    { name: 'param2', type: 'Option<u32>', value: 1 },
    { name: 'param3', type: 'u128', value: 10 },
    { name: 'param4', type: 'u32', value: 1 },
    {
      name: 'param5',
      type: '[u8;20]',
      value: '0x2415d15945d81AEF914efBf9BD4D206987d8Fa8A'
    }
  ],
  indexInBlock: 2,
  blockNumber: 2608887,
  blockTimestamp: 1674784768000,
  extrinsic: {
    method: 'sell',
    section: 'nft',
    versionInfo: '132',
    signer: '0x2415d15945d81AEF914efBf9BD4D206987d8Fa8A',
    args: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
    signature: '0xdee34e3dd209953be3c70ab31c3afb13bf314a99816e0bcea60ca67ef45b7ee90b1b3b642e4ed5420df97cb749685812c0e638676a8067f769e81d3fd062d22701',
    hash: '0x6979288f301463fea426fc884987f7e31ea80ded888dae3b2054a595276347d1',
    tip: 0n
  }
}
```