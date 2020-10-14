import { expect } from 'chai'
import Container from 'typedi'
import { QueryNode, QueryNodeManager, QueryNodeState } from '../../src'
import { logError } from '../../src/utils/errors'
import { sleep, waitFor } from '../../src/utils/wait-for'
import { clearRedis } from './setup-db'

describe('QueryNode', () => {
  before(async () => {
    await QueryNode.create({
      wsProviderURI: process.env.WS_PROVIDER_URI || '',
      redisURI: process.env.REDIS_URI,
    })
  })

  it('Should initialize the indexer', async () => {
    const node = Container.get<QueryNode>('QueryNode')

    expect(node.api, 'Api should be initialized').to.not.be.undefined
    expect(node.indexBuilder, 'IndexBuilder should be initialized').to.not.be
      .undefined
  })

  it('It should start and stop', async () => {
    const node = Container.get<QueryNode>('QueryNode')

    Promise.race([node.start(), sleep(100)])

    expect(node.state).to.be.eq(QueryNodeState.STARTED, 'Should be started')

    await node.stop()

    expect(node.state).to.be.eq(QueryNodeState.STOPPED, 'Should be stopped')
  })
})
