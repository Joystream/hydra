import { GraphQLSource } from './GraphQLSource'
import { IProcessorSource } from './IProcessorSource'
import pImmediate from 'p-immediate'

let eventSource: GraphQLSource

export * from './IProcessorSource'

export async function getProcessorSource(): Promise<IProcessorSource> {
  if (!eventSource) {
    // just to make it async, do some async init here if needed
    await pImmediate()
    eventSource = new GraphQLSource()
  }
  return eventSource
}
