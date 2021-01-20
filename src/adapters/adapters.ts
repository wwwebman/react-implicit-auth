import warning from 'tiny-warning';

import facebook from './facebook';
import google from './google';
import { Adapters, AdapterId, Configs, AdaptersApi } from './types';

const adapters: Adapters = {
  facebook,
  google,
};

export const createAdaptersApi = (configs: Configs): AdaptersApi => {
  return Object.keys(configs).reduce((acc, adapterId: AdapterId) => {
    const config = configs[adapterId];
    const adapter = adapters[adapterId];

    warning(Boolean(adapter), `The "${adapterId}" adapter is not exist.`);

    return {
      ...acc,
      [adapterId]: { ...adapter(config, adapterId), config },
    };
  }, {});
};
