export const QUERIES_FOLDER = 'queries'
export const ENUMS_FOLDER = 'enums'
export const VARIANTS_FOLDER = 'variants'
export const INTERFACES_FOLDER = 'interfaces'
export const JSONFIELDS_FOLDER: [string, string] = [
  'jsonfields',
  'jsonfields.model.ts.mst',
]

export const GRAPHQL_DATA_TYPES: { [key: string]: string } = {
  bool: 'boolean',
  int: 'integer',
  string: 'string',
  float: 'float',
  date: 'date',
  numeric: 'numeric',
  decimal: 'numeric',
}

export const TYPE_FIELDS: { [key: string]: { [key: string]: string } } = {
  bool: {
    decorator: 'BooleanField',
    tsType: 'boolean',
    gqlType: 'Boolean',
  },
  date: {
    decorator: 'DateTimeField',
    tsType: 'Date',
    gqlType: 'GraphQLISODateTime',
  },
  int: {
    decorator: 'IntField',
    tsType: 'number',
    gqlType: 'Int',
  },
  float: {
    decorator: 'FloatField',
    tsType: 'number',
    gqlType: 'Float',
  },
  json: {
    decorator: 'JSONField',
    tsType: 'JsonObject',
    gqlType: 'GraphQLJSONObject',
  },
  otm: {
    decorator: 'OneToMany',
    tsType: '---',
  },
  mto: {
    decorator: 'ManyToOne',
    tsType: '---',
  },
  mtm: {
    decorator: 'ManyToMany',
    tsType: '---',
  },
  string: {
    decorator: 'StringField',
    tsType: 'string',
    gqlType: 'String',
  },
  numeric: {
    decorator: 'NumericField',
    tsType: 'BN',
    gqlType: 'Float',
  },
  decimal: {
    decorator: 'NumericField',
    tsType: 'BN',
    gqlType: 'Float',
  },
  oto: {
    decorator: 'OneToOne',
    tsType: '---',
    gqlType: '',
  },
  array: {
    decorator: 'ArrayField',
    tsType: '', // will be updated with the correct type
    gqlType: '',
  },
  bytes: {
    decorator: 'BytesField',
    tsType: 'Buffer',
    gqlType: 'Buffer',
  },
}
