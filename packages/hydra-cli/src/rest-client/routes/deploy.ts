import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export async function deploy(
  name: string,
  version: string,
  artifactUrl: string
): Promise<{
  id: number
  name: string
  deploymentVersion: { deploymentUrl: string }
} | void> {
  const apiUrl = `${baseUrl}/client/project/${name}/version`
  const response = await request(apiUrl, {
    method: 'post',
    body: JSON.stringify({
      artifactUrl,
      version,
    }),
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
