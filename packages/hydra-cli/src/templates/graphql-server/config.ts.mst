import * as dotenv from 'dotenv'
import { configureWarthogEnv } from './warthog-env'

delete process.env.NODE_ENV
dotenv.config()
configureWarthogEnv()

process.env.PGDATABASE = process.env.DB_NAME
process.env.PGUSER = process.env.DB_USER
process.env.PGPASSWORD = process.env.DB_PASS
process.env.PGHOST = process.env.DB_HOST
process.env.PGPORT = process.env.DB_PORT
