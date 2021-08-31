import { expect } from 'chai'
import { Extrinsic } from '@polkadot/types/interfaces'
import { SubstrateBlockEntity } from './SubstrateBlockEntity'
import { fromBlockExtrinsic } from './SubstrateExtrinsicEntity'

const testData: {
  e: Extrinsic
  blockEntity: SubstrateBlockEntity
  indexInBlock: number
} = {
  e: {
    isSigned: true,
    hash: { toString: () => '0xdcdca' } as any,
    signature: { toString: () => '0xbbbbb' } as any,
    signer: { toString: () => '0xaaaaa' } as any,
    nonce: { toNumber: () => 12332 } as any,
    method: {
      method: 'method',
      section: 'section',
      args: [],
    } as any,
  } as any,
  blockEntity: {
    height: 6666,
    hash: '0xaaaaaa',
  } as any,
  indexInBlock: 1,
}

describe('SubstrateExtrinsicEntity', () => {
  it('handles non-standard tips', () => {
    const fromTestData = fromBlockExtrinsic(testData)

    expect(fromTestData.tip).eq(BigInt(0), 'should set tip to zero by default')
  })

  it('creates block extrinsics', () => {
    const fromTestData = fromBlockExtrinsic(testData)

    expect(fromTestData.hash).eq('0xdcdca', 'should set hash')
    expect(fromTestData.signature).eq('0xbbbbb', 'should set signature')
    expect(fromTestData.signer).eq('0xaaaaa', 'should set signer')
    expect(fromTestData.meta).eql({}, 'should set default meta')
    expect(fromTestData.nonce).eq(12332, 'should set nonce')
  })
})
