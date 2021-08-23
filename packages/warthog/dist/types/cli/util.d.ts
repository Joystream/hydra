/**
 * Indicates, that CLI command completed with error,
 * but all details were already written to STDERR
 */
export declare class CommandError extends Error {
    readonly isCommandError = true;
    constructor();
}
