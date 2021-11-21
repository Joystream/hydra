import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export type ResponseBody = {
  id: string
  name: string
  description: string
  logoUrl: string
  sourceCodeUrl: string
  websiteUrl: string
}

export async function updateApp(
  name: string,
  description?: string,
  logoUrl?: string,
  sourceCodeUrl?: string,
  websiteUrl?: string
): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/project/${name}`
  const response = await request(apiUrl, {
    method: 'put',
    body: JSON.stringify({
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
    return `Updated app with name ${responseBody.name}`
  }
}
