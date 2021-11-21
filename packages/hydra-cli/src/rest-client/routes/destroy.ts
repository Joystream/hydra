import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export async function destroyDeployment(
  appName: string,
  version: number
): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/project/${appName}/version?version=${version}`
  const response = await request(apiUrl, {
    method: 'delete',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Destroyed deployment with name ${responseBody.projectName}`
  }
}

export async function destroyApp(name: string): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/project/${name}`
  const response = await request(apiUrl, {
    method: 'delete',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Destroyed app with name ${responseBody.name}`
  }
}
