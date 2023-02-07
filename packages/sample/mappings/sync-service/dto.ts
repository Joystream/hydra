export class FixedPriceSaleEventDto {
  tokens!: TokenIdDto[]
  marketplaceId?: string
  listingId!: string
  price?: string
  paymentAsset?: string
  buyer?: string
  seller?: string
  eventMethod!: FixedPriceSaleEventMethod
  closeReason?: string
  blockHash!: string
  blockHeight!: number
  extrinsicHash!: string | undefined
  txIndex!: number | undefined
}

export class TokenIdDto {
  collectionId!: string
  serialNumber!: string
}

export enum FixedPriceSaleEventMethod {
  FixedPriceSaleList = 'FixedPriceSaleList',
  FixedPriceSaleComplete = 'FixedPriceSaleComplete',
  FixedPriceSaleClose = 'FixedPriceSaleClose',
  FixedPriceSalePriceUpdate = 'FixedPriceSalePriceUpdate',
}
