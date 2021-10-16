import * as fs from 'fs'
import * as path from 'path'
import { Output } from '@subsquid/openreader/dist/util'

export class FileOutput extends Output {
  constructor(private file: string) {
    super()
  }

  write(): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true })
    fs.writeFileSync(this.file, this.toString())
  }
}

export class OutDir {
  constructor(private dir: string) {}

  del(): void {
    fs.rmSync(this.dir, { recursive: true, force: true })
  }

  file(name: string): FileOutput {
    return new FileOutput(path.join(this.dir, name))
  }

  addResource(name: string, target?: string): void {
    const src = path.join(__dirname, '../../resource', name)
    const dst = path.join(this.dir, target || name)
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    fs.copyFileSync(src, dst)
  }

  write(name: string, content: string): void {
    const dst = path.join(this.dir, name)
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    fs.writeFileSync(dst, content)
  }
}
