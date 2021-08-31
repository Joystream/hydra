import { WarthogGluegunToolbox } from '../types';
import { CommandError } from '../util';

export default {
  name: 'db:create',
  run: async (toolbox: WarthogGluegunToolbox) => {
    const {
      db,
      config: { load },
    } = toolbox;

    const config = load();
    const ok = await db.create(config.get('DB_DATABASE'));
    if (!ok) {
      throw new CommandError();
    }
  },
};
