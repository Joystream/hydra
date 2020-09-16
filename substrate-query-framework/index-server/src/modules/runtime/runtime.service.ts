import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { BaseService } from "warthog";

import { Runtime } from "./runtime.model";

@Service("RuntimeService")
export class RuntimeService extends BaseService<Runtime> {
  constructor(
    @InjectRepository(Runtime)
    protected readonly repository: Repository<Runtime>
  ) {
    super(Runtime, repository);
  }
}
