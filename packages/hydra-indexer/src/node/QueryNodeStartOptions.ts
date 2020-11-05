export type QueryNodeStartUpOptions = IndexerOptions

export interface IndexerOptions {
  atBlock?: number
  typeRegistrator?: () => void
  wsProviderURI: string
  redisURI?: string
  types?: Record<string, Record<string, string>>
}
