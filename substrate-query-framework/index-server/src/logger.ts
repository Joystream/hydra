/* eslint-disable no-console */

import * as util from 'util'

import { getBindingError } from 'warthog'
import Debug from 'debug'
const debug = Debug('index-server:logger')

export class Logger {
  static info(...args: any[]): void {
    args = args.length === 1 ? args[0] : args
    debug(`INFO: ${JSON.stringify(args, null, 2)}`)
    console.log(util.inspect(args, { showHidden: false, depth: null }))
  }

  static error(...args: any[]): void {
    args = args.length === 1 ? args[0] : args
    debug(`Errors: ${JSON.stringify(args, null, 2)}`)

    console.error(util.inspect(args, { showHidden: false, depth: null }))
  }

  // static debug(...args: any[]) {
  //   console.debug(args);
  // }

  static log(...args: any[]): void {
    debug(`LOG: ${JSON.stringify(args, null, 2)}`)
    console.log(args)
  }

  static warn(...args: any[]): void {
    debug(`WARN: ${JSON.stringify(args, null, 2)}`)
    console.warn(args)
  }

  // This takes a raw GraphQL error and pulls out the relevant info
  static logGraphQLError(error: Error) {
    debug(
      util.inspect(getBindingError(error), { showHidden: false, depth: null })
    )
  }
}
/* eslint-enable no-console */
