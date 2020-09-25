export function stringifyWithTs(s: Record<string, unknown>): string {
  return JSON.stringify({ ...s, ts: Date.now() })
}