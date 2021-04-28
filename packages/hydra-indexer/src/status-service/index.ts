import { IndexerStatusService } from '..'
import { IStatusService } from './IStatusService'

let statusService: IStatusService

export async function getStatusService(): Promise<IStatusService> {
  if (statusService) {
    return statusService
  }
  statusService = new IndexerStatusService()
  await (<IndexerStatusService>statusService).init()
  return statusService
}
