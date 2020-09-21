import { Service } from 'typedi'
import { getIndexerHead } from '../db/dal';

@Service()
export class IndexerStatusService {
  
  async getIndexerHead(): Promise<number> {
    // TODO: replace with a Redis call or GraphQL subscription
    return await getIndexerHead();
  }

}