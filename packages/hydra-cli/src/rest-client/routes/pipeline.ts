import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'
import queryString from 'query-string'

export type DeployPipelineResponse = {
  projectName: string
  version: string
  status: DeployPipelineStatusEnum
  isErrorOccurred: boolean
  comment: string
  clientId: number
  updatedAt: number
}

export enum DeployPipelineStatusEnum {
  CREATED = 'CREATED',
  IMAGE_BUILDING = 'IMAGE_BUILDING',
  IMAGE_PUSHING = 'IMAGE_PUSHING',
  DEPLOYING = 'DEPLOYING',
  OK = 'OK',
}

export async function getDeployPipeline(
  name: string,
  version: string
): Promise<DeployPipelineResponse | undefined> {
  const apiUrl = `${baseUrl}/client/project/${name}/pipeline`
  const params = queryString.stringify({ version })
  const response = await request(`${apiUrl}?${params}`, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return responseBody
  }
}
