import assert from 'assert'
import fetch from 'node-fetch'
import { GqlClient } from './gql-client'

export const queryNode = new GqlClient('http://query-node:4000/graphql')

export interface ProcessorStatus {
  lastCompleteBlock: number
  indexerHead: number
  chainHead: number
}

export async function getProcessorStatus(): Promise<ProcessorStatus> {
  const response = await fetch('http://hydra-processor:3000/metrics')
  if (!response.ok) {
    throw new Error(
      `Got http ${response.status}, body: ${await response.text()}`
    )
  }
  const text = await response.text()
  const status: Partial<ProcessorStatus> = {}
  text.split('\n').forEach((line) => {
    line = line.trim()
    if (!line) return
    const [metric, value] = line.split(/\s+/)
    switch (metric) {
      case 'hydra_processor_last_processed_block':
        status.lastCompleteBlock = Number.parseInt(value)
        break
      case 'hydra_processor_indexer_head':
        status.indexerHead = Number.parseInt(value)
        break
      case 'hydra_processor_chain_height':
        status.chainHead = Number.parseInt(value)
        break
    }
  })
  assert(Object.keys(status).length === 3, 'failed to extract all metrics')
  return status as ProcessorStatus
}

/**
 * Wait until the indexer indexes the block and the processor picks it up
 */
export async function waitForProcessing(nBlocks = 0): Promise<void> {
  while (true) {
    try {
      const status = await getProcessorStatus()
      if (status.lastCompleteBlock > nBlocks) {
        return
      }
    } catch (e: any) {
      if (e.message.startsWith('Got http')) {
        throw e
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
