import EventEmitter from 'events'

export const eventEmitter = new EventEmitter()

export enum Events {
  NEW_BLOCK_ARRIVED = 'NEW_BLOCK_ARRIVED',
  NODE_STOP = 'NODE_STOP',
}
