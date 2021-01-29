import express from 'express'
import { register, validateMetricName } from 'prom-client'

export function startPromEndpoint(): void {
  const server = express()

  // Setup server to Prometheus scrapes:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server.get('/metrics', (req: any, res: any) => {
    try {
      res.set('Content-Type', register.contentType)
      res.end(register.metrics())
    } catch (ex) {
      res.status(500).end(ex)
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server.get('/metrics/:metricName', (req: any, res: any) => {
    try {
      res.set('Content-Type', register.contentType)
      if (
        !req.params.metricName ||
        !validateMetricName(req.params.metricName)
      ) {
        res.status(400).end('No requested metric found')
      }
      res.end(register.getSingleMetricAsString(req.params.metricName))
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
