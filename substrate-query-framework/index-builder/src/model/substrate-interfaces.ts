import { Codec } from '@polkadot/types/types';
import { AnyJson, AnyJsonField } from '../interfaces/json-types'
import * as BN from 'bn.js';

export interface EventParameters {
  // TODO how do we reprsent it?
  [key: string]: Codec;
}

export interface ExtrinsicArg {
  type: string;
  name: string;
  value: AnyJsonField;
}

export interface SubstrateEvent {
  event_name: string;
  event_method: string;
  event_params: EventParameters;
  index: number;
  id: string;
  block_number: number;
  extrinsic?: SubstrateExtrinsic;
}

export interface SubstrateExtrinsic {
  method: string;
  section: string;
  versionInfo: string;
  meta: AnyJson;
  era: AnyJson;
  signer: string;
  args: ExtrinsicArg[];
  signature: string;
  hash: string;
  tip: BN;
}

