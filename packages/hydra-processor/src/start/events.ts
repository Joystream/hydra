import { EventEmitter } from 'events'

export const eventEmitter = new EventEmitter()

// fired when an index head is updated
export const NEW_INDEXER_HEAD = 'NEW_INDEXER_HEAD'
// fired when a new batch of events is processed
export const PROCESSED_EVENT = 'PROCESSED_EVENT'
// fired when the processor state has changed
export const STATE_CHANGE = 'STATE_CHANGE'
