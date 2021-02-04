import React, { useEffect, useMemo } from 'react';
import type { Configs } from '../adapters/types';
import { createAdaptersApi } from '../adapters';
import ImplicitAuthContext from './ImplicitAuthContext';

export interface ImplicitAuthProviderProps {
  /** Configurations for SDK providers. */
  configs: Configs;

  /** Gets called on SDK init error. */
  onInitError?(error?: any): void;

  /** Gets called on SDK init success. */
  onInitSuccess?(error?: any): void;

  /** Loads SDK scripts and initialize using `config` on page init. */
  autoInit?: boolean;

  /**
   * Gets login status on page init and allows to authenticate users automatically
   * if a token has not been expired. This can be helpful when a user reloads the page.
   * Normally, after page reload a user have to click login button again.
   * Using this prop it might be done automatically.
   */
  autoLogin?: boolean;

  /** Gets called on login error. */
  onAutoLoginError?(error?: any): void;

  /** Gets called on login error. */
  onAutoLoginSuccess?(auth?: any): void;
}

/**
 * A React context provider component that passes custom social API
 * methods to the context.
 */
const ImplicitAuthProvider: React.FC<ImplicitAuthProviderProps> = ({
  autoInit = true,
  autoLogin = true,
  children,
  configs,
  onAutoLoginError = () => {},
  onAutoLoginSuccess = () => {},
  onInitError = () => {},
  onInitSuccess = () => {},
}) => {
  const adaptersApi = useMemo(() => createAdaptersApi(configs), [configs]);

  useEffect(() => {
    Object.keys(adaptersApi).forEach(
      async (adapterId: keyof typeof adaptersApi) => {
        const adapter = adaptersApi[adapterId];

        if (autoInit) {
          await adapter.init().then(onInitSuccess, onInitError);

          if (autoLogin) {
            await adapter
              .autoLogin()
              .then(onAutoLoginSuccess, onAutoLoginError);
          }
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

/** @component */
export default ImplicitAuthProvider;
