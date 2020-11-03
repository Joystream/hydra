import * as express from 'express'
import { register, validateMetricName } from 'prom-client'

export function startPromEndpoint() {
  const server = express()

  // Setup server to Prometheus scrapes:

  server.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType)
      res.end(await register.metrics())
    } catch (ex) {
      res.status(500).end(ex)
    }
  })

  server.get('/metrics/:metricName', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType)
      if (
        !req.params.metricName ||
        !validateMetricName(req.params.metricName)
      ) {
        res.status(400).end('No requested metric found')
      }
      res.end(await register.getSingleMetricAsString(req.params.metricName))
    } catch (ex) {
      res.status(500).end(ex)
    }
  })

  const port = process.env.PROMETHEUS_PORT || 3000
  console.log(
    `Server listening to ${port}, metrics exposed on /metrics endpoint`
  )
  server.listen(port)
}
