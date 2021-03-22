import { EventQueue } from './EventQueue'
import { IEventQueue } from './IEventQueue'

export * from './IEventQueue'

let eventQueue: IEventQueue

export const getEventQueue: () => IEventQueue = () => {
  if (!eventQueue) {
    eventQueue = new EventQueue()
  }
  return eventQueue
}
