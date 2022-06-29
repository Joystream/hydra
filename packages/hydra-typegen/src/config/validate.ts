import { IConfig } from '../commands/typegen'

export function validate({ events, calls }: IConfig): void {
  if (events.length === 0 && calls.length === 0) {
    throw new Error(
      `Nothing to generate: at least one event or call should be provided.`
    )
  }
}
