import { BaseModel, Model, StringField } from '@subsquid/warthog'

@Model({ api: {} })
export class DeepModel extends BaseModel {
  @StringField({
    nullable: false,
  })
  greeting!: string
}
