import {
  BaseModel,
  Model,
  StringField,
  IntField,
  JSONField,
  JsonObject
} from "warthog";

@Model({ db: { name: "runtime" } })
export class Runtime extends BaseModel {
  @StringField({ nullable: true })
  implVersion?: string;

  /**
   * id = sa.Column(sa.Integer(), primary_key=True, autoincrement=False)
    impl_name = sa.Column(sa.String(255))
    impl_version = sa.Column(sa.Integer())
    spec_version = sa.Column(sa.Integer(), nullable=False, unique=True)
    spec_name = sa.Column(sa.String(255))
    authoring_version = sa.Column(sa.Integer())
    apis = sa.Column(sa.JSON(), default=None, server_default=None, nullable=True)
    json_metadata = sa.Column(sa.JSON(), default=None, server_default=None, nullable=True)
    json_metadata_decoded = sa.Column(sa.JSON(), default=None, server_default=None, nullable=True)
   */

  @StringField()
  implName!: string;

  @IntField()
  specVersion!: number;

  @StringField({ nullable: true })
  specName?: string;

  @IntField({ nullable: true })
  authoringVersion?: number;

  @JSONField({ nullable: true })
  apis?: JsonObject;

  @JSONField({ nullable: true })
  metadata?: JsonObject;
}
