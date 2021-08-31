/**
 * Indicates, that CLI command completed with error,
 * but all details were already written to STDERR
 */
export class CommandError extends Error {
  public readonly isCommandError = true;
  constructor() {
    super('command failed');
  }
}
