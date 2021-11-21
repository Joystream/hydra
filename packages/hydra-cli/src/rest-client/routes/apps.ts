import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

type AppListResponse = {
  id: number
  name: string
  description: string
  logoUrl: string
  sourceCodeUrl: string
  websiteUrl: string
}

export async function appList(): Promise<AppListResponse[] | undefined> {
  const apiUrl = `${baseUrl}/client/project`
  const response = await request(apiUrl, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody: AppListResponse[] = await response.json()
  if (response.status === 200) {
    return responseBody
  }
}
