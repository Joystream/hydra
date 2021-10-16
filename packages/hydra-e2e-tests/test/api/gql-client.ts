import expect from 'expect'
import fetch from 'node-fetch'

export class GqlClient {
  constructor(private endpoint: string) {}

  async query<R = any>(query: string): Promise<R> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(
        `Got http ${response.status}, body: ${await response.text()}`
      )
    }
    const payload = await response.json()
    return payload.data as R
  }

  async test(query: string, expectedData: any): Promise<void> {
    const response = await this.query(query)
    expect(response).toEqual(expectedData)
  }
}
