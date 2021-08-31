import { WarthogGluegunToolbox } from '../types';
import { CommandError } from '../util';

export default {
  name: 'db:drop',
  run: async (toolbox: WarthogGluegunToolbox) => {
    const { db } = toolbox;
    const ok = await db.drop();
    if (!ok) {
      throw new CommandError();
    }
  },
};
