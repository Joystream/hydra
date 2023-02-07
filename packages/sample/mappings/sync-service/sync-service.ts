import axios from 'axios'
import { FixedPriceSaleEventDto } from './dto'

const baseSyncServiceUrl =
  'https://api-dev.halolaboratory.xyz/indexer-sync/sync'

export async function listFixedPrice(
  event: FixedPriceSaleEventDto
): Promise<string> {
  await axios.post(`${baseSyncServiceUrl}/fixed-price-sale-events`, [event])
  return ''
}
