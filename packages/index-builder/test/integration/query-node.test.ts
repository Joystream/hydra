import { expect } from 'chai'
import Container from 'typedi'
import { QueryNode, QueryNodeState } from '../../src'
import { sleep } from '@dzlzv/hydra-common'

describe('QueryNode', () => {
  before(async () => {
    await QueryNode.create({
      wsProviderURI: process.env.WS_PROVIDER_URI || '',
      redisURI: process.env.REDIS_URI,
    })
  })

  it('Should initialize the indexer', async () => {
    const node = Container.get<QueryNode>('QueryNode')

    expect(node.indexBuilder).not.to.be.eq(
      undefined,
      'IndexBuilder should be initialized'
    )

    await Promise.race([node.start(), sleep(100)])

    expect(node.state).to.be.eq(QueryNodeState.STARTED, 'Should be started')

    await node.stop()

    expect(node.state).to.be.eq(QueryNodeState.STOPPED, 'Should be stopped')
  })
})
