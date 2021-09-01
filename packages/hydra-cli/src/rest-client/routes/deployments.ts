import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import fetch from 'node-fetch'

export type ResponseBody = {
  id: string
  status: 'CREATED' | 'BUILDING' | 'ERROR' | 'OK'
  name: string
  artifactUrl: string
  version: number
}

export async function deploymentList(): Promise<ResponseBody[]> {
  const apiUrl = `${baseUrl}/client/deployment`
  const response = await fetch(apiUrl, {
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
  } else {
    throw new Error(
      `Failed, status ${response.status}, message: ${responseBody.message}`
    )
  }
}
