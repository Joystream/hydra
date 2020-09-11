/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * An utility method to extract info from caught objects in try {} catch (e)
 * 
 * @param e any error variable
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logError(e: any): string {
  return JSON.stringify(e, null, 2);
}