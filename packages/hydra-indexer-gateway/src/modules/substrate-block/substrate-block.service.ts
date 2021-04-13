import { BaseService } from 'warthog'
import { Service } from 'typedi'
import { SubstrateBlock } from './substrate-block.model'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

@Service('SubstrateBlockService')
export class SubstrateBlockService extends BaseService<SubstrateBlock> {
  constructor(
    @InjectRepository(SubstrateBlock)
    protected readonly repository: Repository<SubstrateBlock>
  ) {
    super(SubstrateBlock, repository)
  }
}
