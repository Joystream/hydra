import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export type ResponseBody = {
  id: string
  status: 'CREATED' | 'DEPLOYING' | 'ERROR' | 'OK'
  name: string
  artifactUrl: string
  version: number
}

export async function create(
  name: string,
  sourceCodeUrl: string,
  description?: string,
  logoUrl?: string,
  websiteUrl?: string
): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/project`
  const response = await request(apiUrl, {
    method: 'post',
    body: JSON.stringify({
      name,
      description,
      logoUrl,
      sourceCodeUrl,
      websiteUrl,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Created app with name ${responseBody.name}`
  }
}
