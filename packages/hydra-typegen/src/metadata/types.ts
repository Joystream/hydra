import { Option, Vec } from '@polkadot/types/codec'
import { Text } from '@polkadot/types/primitive'
import { Codec } from '@polkadot/types/types'

export type Arg = {
  type: Text
  name: Text
} & Codec

export type Call = {
  args: Vec<Arg>
  name: Text
  documentation?: Vec<Text>
} & Codec

export type Calls = Option<Vec<Call>>

export type Event = {
  args: Vec<Text>
  documentation?: Vec<Text>
  name: Text
} & Codec

export type ModuleMeta = {
  module: Module
  events: Event[]
  calls: Call[]
  types: string[]
}

export type Events = Option<Vec<Event>>

export type Module = {
  // V0
  module?: {
    call: {
      functions: Vec<Call>
    }
  }
  name: Text

  // V1+
  calls?: Calls
  // V6+
  constants?: Vec<{ type: Text } & Codec>
  events?: Events
} & Codec

export interface ExtractedMetadata {
  modules: Vec<Module>

  // V0
  outerEvent?: {
    events: Vec<[Text, Vec<Event>] & Codec>
  }
}

export type TypeDefs = Record<
  string,
  | string
  | Record<string, string>
  | { _enum: string[] | Record<string, string | null> }
  | { _set: Record<string, number> }
>
