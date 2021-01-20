import React, { useEffect, useMemo } from 'react';

import type { Configs } from '../adapters';
import { createAdaptersApi } from '../adapters';
import { ImplicitAuthContext } from './ImplicitAuthContext';

interface ImplicitAuthProviderProps {
  configs: Configs;

  /** Gets called on init error. */
  onInitError?(error?: any): void;

  /** Gets called on init success. */
  onInitSuccess?(error?: any): void;

  /** Inits sdk scripts on component mounting. */
  autoInit?: boolean;

  /**
   * Gets login status on page init.
   * This can be helpful when the user refreshes a page because if a token
   * has not been expired user can use the app without clicking login button.
   */
  autoLogin?: boolean;

  /** Gets called on login error. */
  onLoginError?(error?: any): void;

  /** Gets called on login error. */
  onLoginSuccess?(auth?: any): void;
}

const ImplicitAuthProvider: React.FC<ImplicitAuthProviderProps> = ({
  autoLogin = true,
  children,
  configs,
  onInitError = () => {},
  onInitSuccess = () => {},
  onLoginError = () => {},
  onLoginSuccess = () => {},
}) => {
  const adaptersApi = useMemo(() => createAdaptersApi(configs), [configs]);

  useEffect(() => {
    Object.keys(adaptersApi).forEach(
      async (adapterId: keyof typeof adaptersApi) => {
        const adapter = adaptersApi[adapterId];

        await adapter.init().then(onInitSuccess, onInitError);

        if (autoLogin) {
          await adapter.autoLogin().then(onLoginSuccess, onLoginError);
        }
      },
    );
  }, [adaptersApi]);

  return (
    <ImplicitAuthContext.Provider value={adaptersApi}>
      {children}
    </ImplicitAuthContext.Provider>
  );
};

export default ImplicitAuthProvider;
