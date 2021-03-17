import chalk from 'chalk'

export function warn(message: string): void {
  // TODO: use a proper logger?
  console.warn(`${chalk.green(`WARNING:`)} ${message}`)
}

export function error(message: string): void {
  // TODO: use a proper logger?
  console.error(`${chalk.green(`ERROR:`)} ${message}`)
}

export function info(message: string): void {
  // TODO: use a proper logger?
  console.error(`${chalk.green(`INFO:`)} ${message}`)
}
