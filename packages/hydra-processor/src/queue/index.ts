import { EventQueue } from './EventQueue'
import { IEventQueue } from './IEventQueue'

export * from './IEventQueue'

let eventQueue: EventQueue

export async function getEventQueue(): Promise<IEventQueue> {
  if (!eventQueue) {
    eventQueue = new EventQueue()
    await eventQueue.init()
  }
  return eventQueue
}
