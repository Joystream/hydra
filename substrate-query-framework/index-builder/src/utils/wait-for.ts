export const POLL_INTERVAL_MS = 100;
export const DEFAULT_FETCH_TIMEOUT_MS = 500;

/**
 * Returns a promise which resolves when a certain condition is met
 * 
 * @param condition The promise resolves when `condition()` returns true
 * @param exit (optional) The promise rejects if exit() returns true
 * @param pollInterval (optimal) The sleep interval
 */
export async function waitFor(condition: () => boolean, exit?: () => boolean , pollInterval = POLL_INTERVAL_MS): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined = undefined;   
    const checkCondition = () => {
      if (exit && exit()) {
        if (timeout) {
          clearTimeout(timeout);
        }
        reject("The exit condition has been triggered")
        return;
      }
          
      if (condition()) {
        if (timeout) {
          clearTimeout(timeout);
        }
        resolve()
      } else {
        timeout = setTimeout(checkCondition, pollInterval);
      }    

    }
    checkCondition();
  });
}

/*
 * Await for the promise or reject after a timeout
 */
export async function withTimeout<T>(promiseFn: Promise<T>, rejectMsg?: string, timeoutMS?: number): Promise<T> {
    // Create a promise that rejects in <ms> milliseconds
  const timeoutPromise = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`${rejectMsg || 'Execution time-out'}`);
    }, timeoutMS || DEFAULT_FETCH_TIMEOUT_MS)
  });

    // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promiseFn,
    timeoutPromise
  ]).then(x => x as T);
}