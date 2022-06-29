import { extractTypesFromVariant } from './extract'
import { SiType } from '@polkadot/types/interfaces/scaleInfo'
import { expect } from 'chai'
import { TypeRegistry } from '@polkadot/types'

describe('events', () => {
  it('should parse arg types', () => {
    const registry = new TypeRegistry()
    const meta = registry.createType('Metadata', {
      'metadata': {
        'v14': {
          'lookup': {
            'types': [
              {
                'id': 0,
                'type': {
                  'path': ['sp_core', 'crypto', 'AccountId32'],
                  'params': [],
                  'def': {
                    'composite': {
                      'fields': [
                        {
                          'name': null,
                          'type': 1,
                          'typeName': '[u8; 32]',
                          'docs': [],
                        },
                      ],
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 1,
                'type': {
                  'path': [],
                  'params': [],
                  'def': {
                    'array': {
                      'len': 32,
                      'type': 2,
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 2,
                'type': {
                  'path': [],
                  'params': [],
                  'def': {
                    'primitive': 'U8',
                  },
                  'docs': [],
                },
              },
              {
                'id': 6,
                'type': {
                  'path': [],
                  'params': [],
                  'def': {
                    'primitive': 'U128',
                  },
                  'docs': [],
                },
              },
              {
                'id': 47,
                'type': {
                  'path': [
                    'pallet_im_online',
                    'sr25519',
                    'app_sr25519',
                    'Public',
                  ],
                  'params': [],
                  'def': {
                    'composite': {
                      'fields': [
                        {
                          'name': null,
                          'type': 48,
                          'typeName': 'sr25519::Public',
                          'docs': [],
                        },
                      ],
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 48,
                'type': {
                  'path': ['sp_core', 'sr25519', 'Public'],
                  'params': [],
                  'def': {
                    'composite': {
                      'fields': [
                        {
                          'name': null,
                          'type': 1,
                          'typeName': '[u8; 32]',
                          'docs': [],
                        },
                      ],
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 49,
                'type': {
                  'path': [],
                  'params': [],
                  'def': {
                    'sequence': {
                      'type': 50,
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 50,
                'type': {
                  'path': [],
                  'params': [],
                  'def': {
                    'tuple': [0, 51],
                  },
                  'docs': [],
                },
              },
              {
                'id': 51,
                'type': {
                  'path': ['pallet_staking', 'Exposure'],
                  'params': [
                    {
                      'name': 'AccountId',
                      'type': 0,
                    },
                    {
                      'name': 'Balance',
                      'type': 6,
                    },
                  ],
                  'def': {
                    'composite': {
                      'fields': [
                        {
                          'name': 'total',
                          'type': 52,
                          'typeName': 'Balance',
                          'docs': [],
                        },
                        {
                          'name': 'own',
                          'type': 52,
                          'typeName': 'Balance',
                          'docs': [],
                        },
                        {
                          'name': 'others',
                          'type': 53,
                          'typeName':
                            'Vec<IndividualExposure<AccountId, Balance>>',
                          'docs': [],
                        },
                      ],
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 52,
                'type': {
                  'path': [],
                  'params': [],
                  'def': {
                    'compact': {
                      'type': 6,
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 53,
                'type': {
                  'path': [],
                  'params': [],
                  'def': {
                    'sequence': {
                      'type': 54,
                    },
                  },
                  'docs': [],
                },
              },
              {
                'id': 54,
                'type': {
                  'path': ['pallet_staking', 'IndividualExposure'],
                  'params': [
                    {
                      'name': 'AccountId',
                      'type': 0,
                    },
                    {
                      'name': 'Balance',
                      'type': 6,
                    },
                  ],
                  'def': {
                    'composite': {
                      'fields': [
                        {
                          'name': 'who',
                          'type': 0,
                          'typeName': 'AccountId',
                          'docs': [],
                        },
                        {
                          'name': 'value',
                          'type': 52,
                          'typeName': 'Balance',
                          'docs': [],
                        },
                      ],
                    },
                  },
                  'docs': [],
                },
              },
            ],
          },
        },
      },
    })
    const eventTypes: SiType = registry.createType('SiType', {
      'path': ['pallet_im_online', 'pallet', 'Event'],
      'params': [
        {
          'name': 'T',
          'type': null,
        },
      ],
      'def': {
        'variant': {
          'variants': [
            {
              'name': 'HeartbeatReceived',
              'fields': [
                {
                  'name': 'authority_id',
                  'type': 47,
                  'typeName': 'T::AuthorityId',
                  'docs': [],
                },
              ],
              'index': 0,
              'docs': ['A new heartbeat was received from `AuthorityId`.'],
            },
            {
              'name': 'AllGood',
              'fields': [],
              'index': 1,
              'docs': ['At the end of the session, no offence was committed.'],
            },
            {
              'name': 'SomeOffline',
              'fields': [
                {
                  'name': 'offline',
                  'type': 49,
                  'typeName': 'Vec<IdentificationTuple<T>>',
                  'docs': [],
                },
              ],
              'index': 2,
              'docs': [
                'At the end of the session, at least one validator was found to be offline.',
              ],
            },
          ],
        },
      },
      'docs': [
        '\n\t\t\tThe [event](https://docs.substrate.io/v3/runtime/events-and-errors) emitted\n\t\t\tby this pallet.\n\t\t\t',
      ],
    })

    let types: string[] = []
    eventTypes.def.asVariant.variants.forEach((v) => {
      types = types.concat(extractTypesFromVariant(meta.asLatest, v))
    })

    expect(types).to.include.members([
      'AccountId32',
      'Vec',
      'PalletStakingExposure',
      'PalletImOnlineSr25519AppSr25519Public',
    ])
  })
})
