import { Metadata } from '@polkadot/types'
import { TypeRegistry } from '@polkadot/types/create'
import { WebSocket } from '@polkadot/x-ws'
import fs from 'fs'
import path from 'path'

const debug = require('debug')('hydra-typegen:metadata')

export interface MetadataSource {
  source: string
  blockHash?: string
  spec?: ChainSpec
}

interface ChainSpec {
  specName?: string
  specVersion: number
}

// Retrieve metadata from a chain or a source directory for all (available) chain specs
export async function getAllMetadata({
  source,
  blockHash,
}: MetadataSource): Promise<[Metadata, ChainSpec][]> {
  debug(`Reading metadata: from ${source}`)

  if (source.startsWith('wss://') || source.startsWith('ws://')) {
    debug(`Reading from chain: ${source}`)
    const metaHex = await fromChain(source, blockHash)
    const chainSpec = await getChainSpec(source)
    const registry = new TypeRegistry()
    const meta = new Metadata(registry, metaHex as `0x${string}`)

    return [[meta, chainSpec]]
  } else {
    debug(`Reading from local source: ${source}`)
    const sourcePath = path.join(process.cwd(), source)

    if (!fs.statSync(sourcePath).isDirectory()) {
      throw new Error(`Metadata source must be a directory: ${source}`)
    }

    return fs.readdirSync(sourcePath).map((file) => {
      const metaHex = require(path.join(sourcePath, file)).result as string
      const specVersion = path.basename(file, path.extname(file))
      const registry = new TypeRegistry()
      const meta = new Metadata(registry, metaHex as `0x${string}`)

      return [meta, { specVersion: parseInt(specVersion) }]
    })
  }
}

async function getChainSpec(endpoint: string): Promise<ChainSpec> {
  return new Promise<ChainSpec>((resolve, reject) => {
    try {
      const websocket = new WebSocket(endpoint)

      websocket.onclose = (event: { code: number; reason: string }): void => {
        reject(
          new Error(
            `disconnected, code: '${event.code}' reason: '${event.reason}'`
          )
        )
      }

      websocket.onerror = (event: unknown): void => {
        reject(new Error(JSON.stringify(event, null, 2)))
      }

      websocket.onopen = (): void => {
        debug('connected')
        websocket.send(
          `{"id":1, "jsonrpc":"2.0", "method": "state_getRuntimeVersion"}`
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      websocket.onmessage = (message: any): void => {
        const data = JSON.parse(message.data)
        if (data.error) {
          reject(new Error(`RPC error: ${JSON.stringify(data.error, null, 2)}`))
        } else {
          resolve(data.result)
        }
        websocket.close()
      }
    } catch (e) {
      reject(
        new Error(
          `Cannot fetch chain spec: ${(e as Error).message}, ${JSON.stringify(
            e,
            null,
            2
          )}`
        )
      )
    }
  })
}

async function fromChain(
  endpoint: string,
  blockHash: string | undefined
): Promise<string> {
  const blockHashParam = blockHash ? `"${blockHash}"` : ''
  return new Promise<string>((resolve, reject) => {
    try {
      const websocket = new WebSocket(endpoint)

      websocket.onclose = (event: { code: number; reason: string }): void => {
        reject(
          new Error(
            `disconnected, code: '${event.code}' reason: '${event.reason}'`
          )
        )
      }

      websocket.onerror = (event: unknown): void => {
        reject(new Error(JSON.stringify(event, null, 2)))
      }

      websocket.onopen = (): void => {
        debug('connected')
        // TODO: support chain height
        websocket.send(
          `{"id":"1","jsonrpc":"2.0","method":"state_getMetadata","params":[${blockHashParam}]}`
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      websocket.onmessage = (message: any): void => {
        const data = JSON.parse(message.data)
        if (data.error) {
          reject(new Error(`RPC error: ${JSON.stringify(data.error, null, 2)}`))
        } else {
          resolve(data.result)
        }
        websocket.close()
      }
    } catch (e) {
      reject(
        new Error(
          `Cannot fetch metadata: ${(e as Error).message}, ${JSON.stringify(
            e,
            null,
            2
          )}`
        )
      )
    }
  })
}
