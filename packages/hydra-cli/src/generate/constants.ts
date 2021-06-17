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
  },
  date: {
    decorator: 'DateTimeField',
    tsType: 'Date',
  },
  int: {
    decorator: 'IntField',
    tsType: 'number',
  },
  float: {
    decorator: 'FloatField',
    tsType: 'number',
  },
  json: {
    decorator: 'JSONField',
    tsType: 'JsonObject',
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
  },
  numeric: {
    decorator: 'NumericField',
    tsType: 'BN',
  },
  decimal: {
    decorator: 'NumericField',
    tsType: 'BN',
  },
  oto: {
    decorator: 'OneToOne',
    tsType: '---',
  },
  array: {
    decorator: 'ArrayField',
    tsType: '', // will be updated with the correct type
  },
  bytes: {
    decorator: 'BytesField',
    tsType: 'Buffer',
  },
}
