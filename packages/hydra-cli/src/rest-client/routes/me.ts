import { baseUrl } from '../baseUrl'
import fetch from 'node-fetch'

export async function me(authToken: string): Promise<string> {
  const apiUrl = `${baseUrl}/client/me`
  const response = await fetch(apiUrl, {
    headers: {
      authorization: `token ${authToken}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Successfully logged as ${responseBody.username}`
  } else {
    throw new Error(
      `Failed, status ${response.status}, message: ${responseBody.message}`
    )
  }
}
