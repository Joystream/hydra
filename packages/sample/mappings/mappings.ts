import {
  Transfer,
  BlockTimestamp,
  BlockHook,
  HookType,
  Account,
  NftFixedPriceSale,
  TokenId,
} from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances, Nft } from './generated/types'
import BN from 'bn.js'
import {
  EventContext,
  BlockContext,
  StoreContext,
  DatabaseManager,
  FindOptionsWhere,
} from '@joystream/hydra-common'
import {
  FixedPriceSaleEventDto,
  FixedPriceSaleEventMethod,
  TokenIdDto,
} from './sync-service/dto'
import { listFixedPrice } from './sync-service/sync-service'

const start = Date.now()
const blockTime = 0
let totalEvents = 0
let totalBlocks = 0

async function getOrCreate<T>(
  e: { new (...args: any[]): T },
  id: string,
  store: DatabaseManager
): Promise<T> {
  let entity: T | undefined = await store.get<T>(e, {
    where: { id } as unknown as FindOptionsWhere<T>,
  })

  if (entity === undefined) {
    // eslint-disable-next-line new-cap
    entity = new e() as T
    ;(<any>entity).id = id
  }
  return entity
}

export async function balancesTransfer({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const transfer = new Transfer()
  const [from, to, value] = new Balances.TransferEvent(event).params
  const fromAcc = await getOrCreate<Account>(Account, from.toString(), store)
  fromAcc.hex = from.toHex()
  const toAcc = await getOrCreate<Account>(Account, to.toString(), store)
  toAcc.hex = to.toHex()

  transfer.value = value.toBn()
  transfer.tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)

  fromAcc.balance = fromAcc.balance || new BN(0)
  fromAcc.balance = fromAcc.balance.sub(value)
  fromAcc.balance = fromAcc.balance.sub(transfer.tip)

  await store.save<Account>(fromAcc)

  toAcc.balance = toAcc.balance || new BN(0)
  toAcc.balance = toAcc.balance.add(value)
  await store.save<Account>(toAcc)

  transfer.from = fromAcc
  transfer.to = toAcc

  transfer.insertedAt = new Date(block.timestamp)
  transfer.block = block.height
  transfer.comment = `Transferred ${transfer.value} from ${transfer.from} to ${transfer.to}`
  transfer.timestamp = new BN(block.timestamp)
  totalEvents++

  await store.save<Transfer>(transfer)
}

export async function nftFixedPriceSaleList({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const fixedPriceListing = new NftFixedPriceSale()

  const [tokens, listingId, marketplaceId, price, paymentAsset, seller] =
    new Nft.FixedPriceSaleListEvent(event).params

  const fromAcc = await getOrCreate<Account>(Account, seller.toString(), store)
  fromAcc.hex = seller.toHex()
  fromAcc.balance = fromAcc.balance || new BN(0)
  await store.save<Account>(fromAcc)

  fixedPriceListing.listingId = listingId.toBn()
  fixedPriceListing.marketplaceId = marketplaceId?.value.toBn()
  fixedPriceListing.price = price.toBn()
  fixedPriceListing.paymentAsset = paymentAsset.toBn()
  fixedPriceListing.seller = fromAcc

  await store.save<NftFixedPriceSale>(fixedPriceListing)

  const tokensDto: TokenIdDto[] = []
  for (const token of tokens) {
    const tokenId = await getOrCreate<TokenId>(
      TokenId,
      `${token[0]} - ${token[1]}`,
      store
    )
    tokenId.status = 'listing'
    tokenId.collectionId = token[0]
    tokenId.serialNumber = token[1]
    tokenId.fixedPriceListingId = fixedPriceListing

    tokensDto.push({
      collectionId: token[0].toString(),
      serialNumber: token[1].toString(),
    })

    await store.save<TokenId>(tokenId)
  }

  totalEvents++

  // step: call sync service
  const dto = new FixedPriceSaleEventDto()
  dto.eventMethod = FixedPriceSaleEventMethod.FixedPriceSaleList
  dto.blockHash = block.hash
  dto.blockHeight = block.height
  dto.extrinsicHash = extrinsic?.hash
  dto.txIndex = event.indexInBlock
  dto.tokens = tokensDto
  dto.listingId = listingId.toString()
  dto.marketplaceId = marketplaceId.toString()
  dto.seller = seller.toString()
  dto.price = price.toString()
  dto.paymentAsset = paymentAsset.toString()
  await listFixedPrice(dto)
}

// export async function timestampCall({
//   store,
//   event,
//   block,
// }: ExtrinsicContext & StoreContext) {
//   const call = new Timestamp.SetCall(event)
//   const ts = call.args.now.toBn()
//   const blockTs = await store.get(BlockTimestamp, {
//     where: { timestamp: ts },
//   })

//   if (blockTs === undefined) {
//     throw new Error(`Expected the timestamp ${ts.toString()} to be saved`)
//   }

//   if (block.timestamp !== ts.toNumber()) {
//     throw new Error(`Block timestamp should match the time int TimeStamp`)
//   }
// }

export async function preHook({
  block: { height, timestamp, hash },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()

  const ts = new BlockTimestamp()

  ts.blockNumber = new BN(height)
  ts.id = hash
  ts.timestamp = new BN(timestamp)

  await store.save<BlockTimestamp>(ts)
  hook.timestamp = ts
  hook.blockNumber = new BN(height)
  hook.type = HookType.PRE
  await store.save<BlockHook>(hook)
}

export async function postHook({
  block: { height, hash },
  store,
}: BlockContext & StoreContext) {
  const hook = new BlockHook()
  hook.blockNumber = new BN(height)

  hook.timestamp = <BlockTimestamp>(
    await store.get(BlockTimestamp, { where: { id: hash } })
  )
  hook.type = HookType.POST

  await store.save<BlockHook>(hook)
  totalBlocks++
  benchmark()
}

function benchmark() {
  const millis = Date.now() - start
  if (totalEvents % 10 === 0) {
    console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`)
    console.log(
      `Everage event time ms: ${millis / totalEvents}, block exec time ms: ${
        blockTime / totalBlocks
      }, total events: ${totalEvents}, total blocks: ${totalBlocks}`
    )
  }
}
