import chalk from 'chalk'

export function warn(message: string): void {
  // TODO: use a proper logger?
  console.warn(chalk.yellow(`WARNING: ${message}`))
}

export function error(message: string): void {
  // TODO: use a proper logger?
  console.error(chalk.red(`ERROR: ${message}`))
}

export function info(message: string): void {
  // TODO: use a proper logger?
  console.error(chalk.green(`INFO: ${message}`))
}
