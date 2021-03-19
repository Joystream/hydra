import { GraphQLSource } from './GraphQLSource'
import { IEventsSource } from './IEventsSource'

export * from './IEventsSource'

let eventSource: IEventsSource

export const getEventSource: () => IEventsSource = () => {
  if (!eventSource) {
    eventSource = new GraphQLSource()
  }
  return eventSource
}
