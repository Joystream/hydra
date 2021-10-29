import { Service } from 'typedi'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { BaseService } from '@joystream/warthog'

import { SubstrateExtrinsic } from './substrate-extrinsic.model'

@Service('SubstrateExtrinsicService')
export class SubstrateExtrinsicService extends BaseService<SubstrateExtrinsic> {
  constructor(
    @InjectRepository(SubstrateExtrinsic)
    protected readonly repository: Repository<SubstrateExtrinsic>
  ) {
    super(SubstrateExtrinsic, repository)
  }
}
