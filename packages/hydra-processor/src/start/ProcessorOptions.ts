import { QueryEventProcessingPack } from './QueryEventProcessingPack'

export interface ProcessorOptions {
  processingPack: QueryEventProcessingPack
  // translates event handler to the even name, e.g. handleTreasuryDeposit -> treasury.Deposit
  mappingToEventTranslator?: (mapping: string) => string
  name?: string
  atBlock?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entities?: any[]
  indexerEndpointURL?: string
  manifest?: string
}
