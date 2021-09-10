import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export type ResponseBody = {
  id: string
  status: 'CREATED' | 'BUILDING' | 'ERROR' | 'OK'
  name: string
  artifactUrl: string
  version: number
}

export async function deploymentList(): Promise<ResponseBody[] | undefined> {
  const apiUrl = `${baseUrl}/client/deployment`
  const response = await request(apiUrl, {
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
