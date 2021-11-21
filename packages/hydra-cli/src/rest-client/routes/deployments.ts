import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

type DeploymentStatus = 'CREATED' | 'BUILDING' | 'ERROR' | 'OK'

export type DeploymentListResponse = {
  name: string
  version: string
  artifactUrl: string
  deploymentUrl: string
  status: DeploymentStatus
  createdAt: number
}

export async function deploymentList(
  appName: string
): Promise<DeploymentListResponse[] | undefined> {
  const apiUrl = `${baseUrl}/client/project/${appName}/versions`
  const response = await request(apiUrl, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody: DeploymentListResponse[] = await response.json()
  if (response.status === 200) {
    return responseBody
  }
}
