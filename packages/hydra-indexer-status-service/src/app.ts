import express from 'express'
import Redis from 'ioredis'
import fs from 'fs'
import PATH from 'path'

const hydraVersion = process.env.HYDRA_VERSION || readPackageVersion()
const redis = new Redis(process.env.REDIS_URI)
const app = express()

app.all('/status', async function (req, res) {
  const status = await redis.hgetall('hydra:indexer:status')

  function integer(prop: string): number {
    if (status?.[prop] == null || status[prop].length === 0) return -1
    const value = Number.parseInt(status[prop])
    return Number.isFinite(value) ? value : -1
  }

  const head = integer('HEAD')
  const chainHeight = integer('CHAIN_HEIGHT')
  const lastComplete = integer('LAST_COMPLETE')
  const maxComplete = integer('MAX_COMPLETE')
  const inSync = chainHeight === head && head > 0

  res.json({
    hydraVersion,
    head,
    chainHeight,
    lastComplete,
    maxComplete,
    inSync,
  })
})

app.set('etag', false)

app.listen(process.env.PORT || 3000, () => {
  console.error(
    `hydra indexer status service is listening on port ${
      process.env.PORT || 3000
    }`
  )
})

function readPackageVersion() {
  const json = fs.readFileSync(PATH.join(__dirname, '../package.json'), 'utf8')
  return (JSON.parse(json) as any).version
}
