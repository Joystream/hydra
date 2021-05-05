import { SubstrateBlock, SubstrateEvent, SubstrateExtrinsic } from '.'
import { DatabaseManager } from './store'

export interface StoreContext {
  store: DatabaseManager
}

export interface BlockContext {
  block: SubstrateBlock
}

export interface EventContext extends BlockContext {
  event: SubstrateEvent
  extrinsic?: SubstrateExtrinsic
}

export interface ExtrinsicContext extends BlockContext {
  event: SubstrateEvent
  extrinsic: SubstrateExtrinsic
}

export type MappingContext = BlockContext | EventContext | ExtrinsicContext

export type ExecContext = StoreContext & MappingContext
