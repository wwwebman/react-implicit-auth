import warning from 'tiny-warning';

import facebook from './facebook';
import google from './google';
import { Adapters, Provider, Config, AdaptersApi } from './types';

const adapters: Adapters = {
  facebook,
  google,
};

export const createAdaptersApi = (config: Config): AdaptersApi => {
  return Object.keys(config).reduce((acc, provider: Provider) => {
    const adapterConfig = config[provider];
    const adapter = adapters[provider];

    warning(Boolean(adapter), `The "${provider}" adapter is not exist.`);

    return {
      ...acc,
      [provider]: { ...adapter(adapterConfig, provider), adapterConfig },
    };
  }, {});
};
