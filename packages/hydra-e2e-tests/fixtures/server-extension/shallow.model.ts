import { BaseModel, Model, StringField } from '@subsquid/warthog'

@Model({ api: {} })
export class ShallowModel extends BaseModel {
  @StringField({
    nullable: false,
  })
  greeting!: string
}
