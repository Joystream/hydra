import { GraphQLSource } from './GraphQLSource'
import { IEventsSource } from './IEventsSource'
import pImmediate from 'p-immediate'

export * from './IEventsSource'

let eventSource: GraphQLSource

export async function getEventSource(): Promise<IEventsSource> {
  if (!eventSource) {
    // just to make it async, do some async init here if needed
    await pImmediate()
    eventSource = new GraphQLSource()
  }
  return eventSource
}
