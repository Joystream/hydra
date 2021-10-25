import { Metadata, TypeRegistry } from '@polkadot/types'
import type { MetadataLatest } from '@polkadot/types/interfaces'
import { WebSocket } from '@polkadot/x-ws'
import * as fs from 'fs'

export interface MetadataSource {
  source: string
  blockHash?: string
  typesJson?: any
}

export async function getMetadata(
  src: MetadataSource
): Promise<MetadataLatest> {
  const hex =
    src.source.startsWith('ws://') || src.source.startsWith('wss://')
      ? await fetchChainMetadata(src.source, src.blockHash)
      : JSON.parse(fs.readFileSync(src.source, 'utf-8')).result

  const registry = new TypeRegistry()
  if (src.typesJson) {
    registry.register(src.typesJson)
  }

  const metadata = new Metadata(registry, hex)
  registry.setMetadata(metadata)
  return metadata.asLatest
}

async function fetchChainMetadata(
  endpoint: string,
  blockHash: string | undefined
): Promise<string> {
  const blockHashParam = blockHash ? `"${blockHash}"` : ''
  return new Promise<string>((resolve, reject) => {
    try {
      const websocket = new WebSocket(endpoint)

      websocket.onclose = (event: { code: number; reason: string }) => {
        reject(
          new Error(
            `disconnected, code: '${event.code}' reason: '${event.reason}'`
          )
        )
      }

      websocket.onerror = (event: unknown) => {
        reject(new Error(JSON.stringify(event, null, 2)))
      }

      websocket.onopen = () => {
        websocket.send(
          `{"id":"1","jsonrpc":"2.0","method":"state_getMetadata","params":[${blockHashParam}]}`
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      websocket.onmessage = (message: any) => {
        const data = JSON.parse(message.data)
        if (data.error) {
          reject(new Error(`RPC error: ${JSON.stringify(data.error, null, 2)}`))
        } else {
          resolve(data.result)
        }
        websocket.close()
      }
    } catch (e: any) {
      reject(
        new Error(
          `Cannot fetch metadata: ${e.message}, ${JSON.stringify(e, null, 2)}`
        )
      )
    }
  })
}
