import 'graphql-import-node'; // Needed so you can import *.graphql files 

import { makeBindingClass, Options } from 'graphql-binding'
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import * as schema from  './schema.graphql'

export interface Query {
    indexerStatus: <T = IndexerStatus>(args?: {}, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    substrateBlocks: <T = Array<SubstrateBlock>>(args: { offset?: Int | null, limit?: Int | null, where?: SubstrateBlockWhereInputAugmented | null, orderBy?: SubstrateBlockOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    eventsConnection: <T = SubstrateEventConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: SubstrateEventWhereInput | null, orderBy?: Array<SubstrateEventOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    substrateEventsAfter: <T = Array<SubstrateEvent>>(args: { afterID?: ID_Output | null, limit?: Int | null, where?: SubstrateEventWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    substrateEvents: <T = Array<SubstrateEvent>>(args: { offset?: Int | null, limit?: Int | null, where?: SubstrateEventWhereInput | null, orderBy?: SubstrateEventOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    substrateEvent: <T = SubstrateEvent>(args: { where: SubstrateEventWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    substrateExtrinsics: <T = Array<SubstrateExtrinsic>>(args: { offset?: Int | null, limit?: Int | null, where?: SubstrateExtrinsicWhereInput | null, orderBy?: SubstrateExtrinsicOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    substrateExtrinsic: <T = SubstrateExtrinsic>(args: { where: SubstrateExtrinsicWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Mutation {}

export interface Subscription {}

export interface Binding {
  query: Query
  mutation: Mutation
  subscription: Subscription
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
  delegateSubscription(fieldName: string, args?: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
  getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(...args: any[]): T
}

export const Binding = makeBindingClass<BindingConstructor<Binding>>({ schema: schema as any })

/**
 * Types
*/

export type SubstrateBlockOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'height_ASC' |
  'height_DESC' |
  'timestamp_ASC' |
  'timestamp_DESC' |
  'hash_ASC' |
  'hash_DESC' |
  'parentHash_ASC' |
  'parentHash_DESC' |
  'stateRoot_ASC' |
  'stateRoot_DESC' |
  'extrinsicsRoot_ASC' |
  'extrinsicsRoot_DESC'

export type SubstrateEventOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'name_ASC' |
  'name_DESC' |
  'section_ASC' |
  'section_DESC' |
  'extrinsicName_ASC' |
  'extrinsicName_DESC' |
  'method_ASC' |
  'method_DESC' |
  'extrinsicHash_ASC' |
  'extrinsicHash_DESC' |
  'blockNumber_ASC' |
  'blockNumber_DESC' |
  'index_ASC' |
  'index_DESC' |
  'blockTimestamp_ASC' |
  'blockTimestamp_DESC'

export type SubstrateExtrinsicOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'tip_ASC' |
  'tip_DESC' |
  'blockNumber_ASC' |
  'blockNumber_DESC' |
  'versionInfo_ASC' |
  'versionInfo_DESC' |
  'method_ASC' |
  'method_DESC' |
  'section_ASC' |
  'section_DESC' |
  'signer_ASC' |
  'signer_DESC' |
  'signature_ASC' |
  'signature_DESC' |
  'nonce_ASC' |
  'nonce_DESC' |
  'hash_ASC' |
  'hash_DESC' |
  'isSigned_ASC' |
  'isSigned_DESC'

export interface BaseWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
}

export interface EventInfoCreateInput {
  id: String
  name: String
  extrinsic?: String | null
}

export interface EventInfoUpdateInput {
  id?: String | null
  name?: String | null
  extrinsic?: String | null
}

export interface EventInfoWhereInput {
  id_eq?: String | null
  id_contains?: String | null
  id_startsWith?: String | null
  id_endsWith?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  name_eq?: String | null
  name_contains?: String | null
  name_startsWith?: String | null
  name_endsWith?: String | null
  name_in?: String[] | String | null
  extrinsic_eq?: String | null
  extrinsic_contains?: String | null
  extrinsic_startsWith?: String | null
  extrinsic_endsWith?: String | null
  extrinsic_in?: String[] | String | null
}

export interface EventInfoWhereUniqueInput {
  id: String
}

export interface ExtrinsicInfoCreateInput {
  id: String
  name: String
}

export interface ExtrinsicInfoUpdateInput {
  id?: String | null
  name?: String | null
}

export interface ExtrinsicInfoWhereInput {
  id_eq?: String | null
  id_contains?: String | null
  id_startsWith?: String | null
  id_endsWith?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  name_eq?: String | null
  name_contains?: String | null
  name_startsWith?: String | null
  name_endsWith?: String | null
  name_in?: String[] | String | null
}

export interface ExtrinsicInfoWhereUniqueInput {
  id: String
}

export interface NameWhereInput {
  name_eq?: String | null
  name_contains?: String | null
  name_startsWith?: String | null
  name_endsWith?: String | null
  name_in?: String[] | String | null
}

export interface SubstrateBlockCreateInput {
  height: Float
  timestamp: Float
  hash: String
  parentHash: String
  stateRoot: String
  extrinsicsRoot: String
  runtimeVersion: JSONObject
  lastRuntimeUpgrade: JSONObject
  events: JSONObject
  extrinsics: JSONObject
}

export interface SubstrateBlockUpdateInput {
  height?: Float | null
  timestamp?: Float | null
  hash?: String | null
  parentHash?: String | null
  stateRoot?: String | null
  extrinsicsRoot?: String | null
  runtimeVersion?: JSONObject | null
  lastRuntimeUpgrade?: JSONObject | null
  events?: JSONObject | null
  extrinsics?: JSONObject | null
}

export interface SubstrateBlockWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  height_eq?: Int | null
  height_gt?: Int | null
  height_gte?: Int | null
  height_lt?: Int | null
  height_lte?: Int | null
  height_in?: Int[] | Int | null
  timestamp_eq?: Int | null
  timestamp_gt?: Int | null
  timestamp_gte?: Int | null
  timestamp_lt?: Int | null
  timestamp_lte?: Int | null
  timestamp_in?: Int[] | Int | null
  hash_eq?: String | null
  hash_contains?: String | null
  hash_startsWith?: String | null
  hash_endsWith?: String | null
  hash_in?: String[] | String | null
  parentHash_eq?: String | null
  parentHash_contains?: String | null
  parentHash_startsWith?: String | null
  parentHash_endsWith?: String | null
  parentHash_in?: String[] | String | null
  stateRoot_eq?: String | null
  stateRoot_contains?: String | null
  stateRoot_startsWith?: String | null
  stateRoot_endsWith?: String | null
  stateRoot_in?: String[] | String | null
  extrinsicsRoot_eq?: String | null
  extrinsicsRoot_contains?: String | null
  extrinsicsRoot_startsWith?: String | null
  extrinsicsRoot_endsWith?: String | null
  extrinsicsRoot_in?: String[] | String | null
  runtimeVersion_json?: JSONObject | null
  lastRuntimeUpgrade_json?: JSONObject | null
  events_json?: JSONObject | null
  extrinsics_json?: JSONObject | null
}

export interface SubstrateBlockWhereInputAugmented {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  height_eq?: Int | null
  height_gt?: Int | null
  height_gte?: Int | null
  height_lt?: Int | null
  height_lte?: Int | null
  height_in?: Int[] | Int | null
  timestamp_eq?: Int | null
  timestamp_gt?: Int | null
  timestamp_gte?: Int | null
  timestamp_lt?: Int | null
  timestamp_lte?: Int | null
  timestamp_in?: Int[] | Int | null
  hash_eq?: String | null
  hash_contains?: String | null
  hash_startsWith?: String | null
  hash_endsWith?: String | null
  hash_in?: String[] | String | null
  parentHash_eq?: String | null
  parentHash_contains?: String | null
  parentHash_startsWith?: String | null
  parentHash_endsWith?: String | null
  parentHash_in?: String[] | String | null
  stateRoot_eq?: String | null
  stateRoot_contains?: String | null
  stateRoot_startsWith?: String | null
  stateRoot_endsWith?: String | null
  stateRoot_in?: String[] | String | null
  extrinsicsRoot_eq?: String | null
  extrinsicsRoot_contains?: String | null
  extrinsicsRoot_startsWith?: String | null
  extrinsicsRoot_endsWith?: String | null
  extrinsicsRoot_in?: String[] | String | null
  runtimeVersion_json?: JSONObject | null
  lastRuntimeUpgrade_json?: JSONObject | null
  events_json?: JSONObject | null
  extrinsics_json?: JSONObject | null
  events_some?: SubstrateEventWhereInput | null
  extrinsics_some?: SubstrateExtrinsicWhereInput | null
}

export interface SubstrateBlockWhereUniqueInput {
  id: ID_Output
}

export interface SubstrateEventCreateInput {
  name: String
  section?: String | null
  extrinsicName?: String | null
  method: String
  phase: JSONObject
  data: JSONObject
  extrinsicHash?: String | null
  blockNumber: Float
  index: Float
  params?: JSONObject | null
  blockTimestamp: Float
}

export interface SubstrateEventUpdateInput {
  name?: String | null
  section?: String | null
  extrinsicName?: String | null
  method?: String | null
  phase?: JSONObject | null
  data?: JSONObject | null
  extrinsicHash?: String | null
  blockNumber?: Float | null
  index?: Float | null
  params?: JSONObject | null
  blockTimestamp?: Float | null
}

export interface SubstrateEventWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  name_eq?: String | null
  name_contains?: String | null
  name_startsWith?: String | null
  name_endsWith?: String | null
  name_in?: String[] | String | null
  section_eq?: String | null
  section_contains?: String | null
  section_startsWith?: String | null
  section_endsWith?: String | null
  section_in?: String[] | String | null
  extrinsicName_eq?: String | null
  extrinsicName_contains?: String | null
  extrinsicName_startsWith?: String | null
  extrinsicName_endsWith?: String | null
  extrinsicName_in?: String[] | String | null
  method_eq?: String | null
  method_contains?: String | null
  method_startsWith?: String | null
  method_endsWith?: String | null
  method_in?: String[] | String | null
  phase_json?: JSONObject | null
  data_json?: JSONObject | null
  extrinsicHash_eq?: String | null
  extrinsicHash_contains?: String | null
  extrinsicHash_startsWith?: String | null
  extrinsicHash_endsWith?: String | null
  extrinsicHash_in?: String[] | String | null
  blockNumber_eq?: Int | null
  blockNumber_gt?: Int | null
  blockNumber_gte?: Int | null
  blockNumber_lt?: Int | null
  blockNumber_lte?: Int | null
  blockNumber_in?: Int[] | Int | null
  index_eq?: Int | null
  index_gt?: Int | null
  index_gte?: Int | null
  index_lt?: Int | null
  index_lte?: Int | null
  index_in?: Int[] | Int | null
  params_json?: JSONObject | null
  blockTimestamp_eq?: Float | null
  blockTimestamp_gt?: Float | null
  blockTimestamp_gte?: Float | null
  blockTimestamp_lt?: Float | null
  blockTimestamp_lte?: Float | null
  blockTimestamp_in?: Float[] | Float | null
}

export interface SubstrateEventWhereUniqueInput {
  id: ID_Output
}

export interface SubstrateExtrinsicCreateInput {
  tip: Float
  blockNumber: Float
  versionInfo: String
  meta: JSONObject
  method: String
  section: String
  args: JSONObject
  signer: String
  signature: String
  nonce: Float
  era: JSONObject
  hash: String
  isSigned: Boolean
}

export interface SubstrateExtrinsicUpdateInput {
  tip?: Float | null
  blockNumber?: Float | null
  versionInfo?: String | null
  meta?: JSONObject | null
  method?: String | null
  section?: String | null
  args?: JSONObject | null
  signer?: String | null
  signature?: String | null
  nonce?: Float | null
  era?: JSONObject | null
  hash?: String | null
  isSigned?: Boolean | null
}

export interface SubstrateExtrinsicWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  tip_eq?: Float | null
  tip_gt?: Float | null
  tip_gte?: Float | null
  tip_lt?: Float | null
  tip_lte?: Float | null
  tip_in?: Float[] | Float | null
  blockNumber_eq?: Int | null
  blockNumber_gt?: Int | null
  blockNumber_gte?: Int | null
  blockNumber_lt?: Int | null
  blockNumber_lte?: Int | null
  blockNumber_in?: Int[] | Int | null
  versionInfo_eq?: String | null
  versionInfo_contains?: String | null
  versionInfo_startsWith?: String | null
  versionInfo_endsWith?: String | null
  versionInfo_in?: String[] | String | null
  meta_json?: JSONObject | null
  method_eq?: String | null
  method_contains?: String | null
  method_startsWith?: String | null
  method_endsWith?: String | null
  method_in?: String[] | String | null
  section_eq?: String | null
  section_contains?: String | null
  section_startsWith?: String | null
  section_endsWith?: String | null
  section_in?: String[] | String | null
  args_json?: JSONObject | null
  signer_eq?: String | null
  signer_contains?: String | null
  signer_startsWith?: String | null
  signer_endsWith?: String | null
  signer_in?: String[] | String | null
  signature_eq?: String | null
  signature_contains?: String | null
  signature_startsWith?: String | null
  signature_endsWith?: String | null
  signature_in?: String[] | String | null
  nonce_eq?: Int | null
  nonce_gt?: Int | null
  nonce_gte?: Int | null
  nonce_lt?: Int | null
  nonce_lte?: Int | null
  nonce_in?: Int[] | Int | null
  era_json?: JSONObject | null
  hash_eq?: String | null
  hash_contains?: String | null
  hash_startsWith?: String | null
  hash_endsWith?: String | null
  hash_in?: String[] | String | null
  isSigned_eq?: Boolean | null
  isSigned_in?: Boolean[] | Boolean | null
}

export interface SubstrateExtrinsicWhereUniqueInput {
  id: ID_Output
}

export interface BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface DeleteResponse {
  id: ID_Output
}

export interface BaseModel extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface BaseModelUUID extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface EventInfo {
  id: String
  name: String
  extrinsic?: String | null
}

export interface EventParam {
  type: String
  name: String
  value?: JSON | null
}

export interface ExtrinsicInfo {
  id: String
  name: String
}

export interface IndexerHead {
  height: Float
  events?: Array<String> | null
}

export interface IndexerStatus {
  head: Int
  lastComplete: Int
  maxComplete: Int
  chainHeight: Int
  inSync: Boolean
  hydraVersion?: String | null
}

export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String | null
  endCursor?: String | null
}

export interface StandardDeleteResponse {
  id: ID_Output
}

export interface SubstrateBlock extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  height: Int
  timestamp: BigInt
  hash: String
  parentHash: String
  stateRoot: String
  extrinsicsRoot: String
  runtimeVersion: JSONObject
  lastRuntimeUpgrade: JSONObject
  events: Array<EventInfo>
  extrinsics: Array<ExtrinsicInfo>
}

export interface SubstrateEvent extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  name: String
  section?: String | null
  extrinsicName?: String | null
  method: String
  phase: JSONObject
  data: JSONObject
  extrinsicHash?: String | null
  blockNumber: Int
  index: Int
  params?: Array<EventParam> | null
  extrinsic?: SubstrateExtrinsic | null
  blockTimestamp: BigInt
}

export interface SubstrateEventConnection {
  totalCount: Int
  edges: Array<SubstrateEventEdge>
  pageInfo: PageInfo
}

export interface SubstrateEventEdge {
  node: SubstrateEvent
  cursor: String
}

export interface SubstrateExtrinsic extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  tip: BigInt
  blockNumber: Int
  versionInfo: String
  meta: JSONObject
  method: String
  section: String
  args: Array<JSONObject>
  signer: String
  signature: String
  nonce: Int
  era: JSONObject
  hash: String
  isSigned: Boolean
}

/*
GraphQL representation of BigNumber
*/
export type BigInt = string

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
The javascript `Date` as string. Type represents date and time as the ISO Date string.
*/
export type DateTime = Date | string

/*
The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).
*/
export type Float = number

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.
*/
export type Int = number

/*
The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
*/
export type JSON = string

/*
The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
*/

    export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

    export type JsonPrimitive = string | number | boolean | null | {};
    
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface JsonArray extends Array<JsonValue> {}
    
    export type JsonObject = { [member: string]: JsonValue };

    export type JSONObject = JsonObject;
  

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string
