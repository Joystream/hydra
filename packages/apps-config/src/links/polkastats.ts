// Copyright 2017-2020 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js'

export default {
  chains: {
    Kusama: 'kusama',
    Polkadot: 'polkadot',
    Westend: 'westend',
  },
  create: (chain: string, path: string, data: BN | number | string): string =>
    `https://${chain}.polkastats.io/${path}/${data.toString()}`,
  isActive: true,
  paths: {
    address: 'account',
    block: 'block',
    extrinsic: 'extrinsic',
    intention: 'intention',
    validator: 'validator',
  },
  url: 'https://polkastats.io/',
}
