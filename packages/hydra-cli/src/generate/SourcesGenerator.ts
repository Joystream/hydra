import * as fs from 'fs-extra'
import * as path from 'path'
import { getTemplatePath, createFile, createDir } from '../utils/utils'

import Debug from 'debug'
import { WarthogModel, ObjectType } from '../model'
import { FTSQueryRenderer } from './FTSQueryRenderer'
import { ModelRenderer } from './ModelRenderer'
import { EnumRenderer } from './EnumRenderer'
import { kebabCase } from './utils'
import { VariantsRenderer } from './VariantsRenderer'
import { render } from './AbstractRenderer'
import { indexContext } from './model-index-context'
import { JsonFieldRenderer } from './JsonFieldRenderer'
import { JSONFIELDS_FOLDER } from './constants'

const debug = Debug('qnode-cli:sources-generator')

/**
 * additional context to be passed to the generator,
 * e.g. to have predictable timestamps
 */
export interface GeneratorContext {
  [key: string]: unknown
}

export class SourcesGenerator {
  dryRun = false

  constructor(
    public readonly outDir: string,
    public readonly model: WarthogModel
  ) {
    this.dryRun = process.env.DRY_RUN === 'true'
  }

  generate(): void {
    this.generateEnums()
    this.generateVariants()
    this.generateModels()
    this.generateQueries()
    this.generateModelIndex()
    this.generateJsonFields()
    this.generateServer()
  }

  generateModels(): void {
    this.mkdir('generated/modules')

    const typesAndInterfaces: ObjectType[] = [
      ...this.model.interfaces,
      ...this.model.entities,
    ]

    typesAndInterfaces.map((objType) => {
      const modelRenderer = new ModelRenderer(this.model, objType, {
        generatedFolderRelPath: '../../warthog',
      })

      const destFolder = `generated/modules/${kebabCase(objType.name)}`
      this.mkdir(destFolder)

      const tempateFile: { [key: string]: string } = {
        model: 'entities/model.ts.mst',
        resolver: objType.isInterface
          ? 'interfaces/resolver.ts.mst'
          : 'entities/resolver.ts.mst',
        service: objType.isInterface
          ? 'interfaces/service.ts.mst'
          : 'entities/service.ts.mst',
      }

      ;['model', 'resolver', 'service'].map((template) => {
        const rendered = modelRenderer.render(
          this.readTemplate(tempateFile[template])
        )
        const destPath = path.join(
          destFolder,
          `${kebabCase(objType.name)}.${template}.ts`
        )
        this.writeFile(destPath, rendered)
      })
    })
  }

  generateQueries(): void {
    // create migrations dir if not exists
    const migrationsDir = 'db/migrations'
    this.mkdir(migrationsDir)

    // create dir if the textsearch module
    const ftsDir = 'generated/modules/queries'
    this.mkdir(ftsDir)

    const queryRenderer = new FTSQueryRenderer({
      generatedFolderRelPath: '../../warthog',
      // add large enough offset, so that search migrations are always applyied after everything else
      ts: Date.now() + 64060578000000,
    })

    this.model.ftsQueries.map((query) => {
      const tempateFile = (name: string) =>
        this.readTemplate(`textsearch/${name}.ts.mst`)

      const destPath = {
        migration: path.join(migrationsDir, `${query.name}.migration.ts`),
        resolver: path.join(ftsDir, `${query.name}.resolver.ts`),
        service: path.join(ftsDir, `${query.name}.service.ts`),
      } as { [key: string]: string }

      ;['migration', 'resolver', 'service'].map((name) => {
        const rendered = queryRenderer.generate(tempateFile(name), query)
        debug(`Writing ${query.name} ${name} to ${destPath[name]}`)
        this.writeFile(destPath[name], rendered)
      })
    })
  }

  generateVariants(): void {
    if (!this.model.unions?.length) {
      return
    }

    const dir = 'generated/modules/variants'
    this.mkdir(dir)

    const renderer = new VariantsRenderer(this.model)
    const template = this.readTemplate('variants/variants.mst')

    this.writeFile(
      path.join(dir, 'variants.model.ts'),
      renderer.render(template)
    )
  }

  generateEnums(): void {
    if (!this.model.enums?.length) {
      return
    }

    const enumsDir = 'generated/modules/enums'
    this.mkdir(enumsDir)

    const enumRenderer = new EnumRenderer(this.model)
    const rendered = enumRenderer.render(
      this.readTemplate('entities/enums.ts.mst')
    )
    this.writeFile(path.join(enumsDir, 'enums.ts'), rendered)
  }

  generateJsonFields(): void {
    const [dir, tmplName] = JSONFIELDS_FOLDER

    const jsonFieldsDir = 'generated/modules/jsonfields'

    this.mkdir(jsonFieldsDir)

    this.writeFile(
      path.join(jsonFieldsDir, tmplName.slice(0, -4)),
      new JsonFieldRenderer(this.model).render(
        this.readTemplate(path.join(dir, tmplName))
      )
    )
  }

  generateModelIndex(): string {
    const rendered = render(
      this.readTemplate('entities/model-all.ts.mst'),
      indexContext(this.model)
    )
    if (!this.dryRun) {
      // create top-level /model folder
      this.mkdir('generated/model')

      // write to /model/index.ts
      this.writeFile(this.output('generated/model/index.ts'), rendered)
    }
    // return the result to simplify testing
    return rendered
  }

  generateServer() {
    this.mkdir('generated/server')

    const templatesDir = getTemplatePath('graphql-server')

    fs.readdirSync(templatesDir).forEach((file) => {
      if (file.endsWith('.mst')) {
        const src = path.join(templatesDir, file)
        const target = this.output(
          `generated/server/${path.basename(file, '.mst')}`
        )
        fs.copyFileSync(src, target)
      }
    })
  }

  /**
   *
   * @param template - relative path to a template from the templates folder, e.g. 'db-helper.mst'
   * @param dest - target file relative to the `this.outDir`
   * @param render - function which transforms the template contents
   */
  private renderAndWrite(
    template: string,
    dest: string,
    render: (data: string) => string
  ) {
    const templateData: string = fs.readFileSync(
      getTemplatePath(template),
      'utf-8'
    )
    debug(`Source: ${getTemplatePath(template)}`)
    const rendered: string = render(templateData)

    debug(`Transformed: ${rendered}`)
    const destFullPath = this.output(dest)

    debug(`Writing to: ${destFullPath}`)
    createFile(destFullPath, rendered, true)
  }

  private readTemplate(relPath: string) {
    debug(`Reading template: ${relPath}`)
    return fs.readFileSync(getTemplatePath(relPath), 'utf-8')
  }

  private writeFile(dest: string, data: string) {
    const destFullPath = this.output(dest)

    debug(`Writing to: ${destFullPath}`)
    createFile(destFullPath, data, true)
  }

  private output(dest): string {
    return path.resolve(this.outDir, dest)
  }

  private mkdir(name: string, del?: boolean) {
    createDir(this.output(name), del, true)
  }
}
