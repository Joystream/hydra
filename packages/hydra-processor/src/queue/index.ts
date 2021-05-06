import { BlockQueue } from './BlockQueue'
import { IBlockQueue } from './IBlockQueue'

export * from './IBlockQueue'

let blockQueue: BlockQueue

export async function getBlockQueue(): Promise<IBlockQueue> {
  if (!blockQueue) {
    blockQueue = new BlockQueue()
    await blockQueue.init()
  }
  return blockQueue
}
