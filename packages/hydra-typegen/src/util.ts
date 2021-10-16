import path from 'path'
import fs from 'fs'

const log = require('debug')('hydra-typegen:util')

export function readTemplate(template: string): string {
  return fs
    .readFileSync(path.join(__dirname, `./templates/${template}.hbs`))
    .toString()
}

export function readFile(source: string): string {
  const location = path.resolve(source)
  log(`Reading: ${location}`)
  return fs.readFileSync(location, 'utf-8')
}

export function readJson(source: string): Record<string, unknown> {
  return JSON.parse(readFile(source))
}

export function writeFile(dest: string, generator: () => string): void {
  log(`${dest}\n\tGenerating`)

  let generated = generator()

  while (generated.includes('\n\n\n')) {
    generated = generated.replace(/\n\n\n/g, '\n\n')
  }

  fs.writeFileSync(dest, generated)
}

export function formatWithPrettier(text: string): string {
  return text
}

export type Key = string | number

export function pushToDictionary<V>(
  dict: Record<Key, V[]>,
  key: Key,
  ...values: V[]
): void {
  if (dict[key] === undefined) {
    dict[key] = [...values]
  } else {
    dict[key].push(...values)
  }
}

/**
 * replace all whitespaces and carriage returns
 *
 * @param s
 * @returns the same string with all whitecharacters removed
 */
export function compact(s: string): string {
  return s.replace(/\s/g, '')
}
