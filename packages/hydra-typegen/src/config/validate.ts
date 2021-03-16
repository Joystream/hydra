import path from 'path'
import fs from 'fs'
import { IConfig } from '../commands/typegen'

export function validate({ events, calls, customTypes }: IConfig): void {
  if (events.length === 0 && calls.length === 0) {
    throw new Error(
      `Nothing to generate: at least one event or call should be provided.`
    )
  }

  if (customTypes) {
    if (customTypes.typedefsLoc === undefined) {
      throw new Error(
        `Missing the type defintion location for the custom for types. Did you forget to add typedefsLoc?`
      )
    }
    const typedefsPath = path.resolve(customTypes.typedefsLoc)
    if (!fs.existsSync(typedefsPath)) {
      throw new Error(`Cannot find type definition file at ${typedefsPath}`)
    }
  }
}
