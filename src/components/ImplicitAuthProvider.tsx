import React, { useEffect, useMemo } from 'react';
import type { Config } from '../adapters/types';
import { createAdaptersApi } from '../adapters';
import ImplicitAuthContext from './ImplicitAuthContext';

export interface ImplicitAuthProviderProps {
  /**
   * Configurations for SDK providers.
   * @see facebook: https://developers.facebook.com/docs/javascript/reference/FB.init
   * @see google: https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientinitargs--
   */
  config: Config;

  /**
   * Allows to load and initialize SDK scripts automatically based on `config`.
   */
  autoInit?: boolean;

  /**
   * Gets called on SDK init error if `autoInit` enabled.
   */
  onInitError?(error?: any): void;

  /**
   * Gets called on SDK init success if `autoInit` enabled.
   */
  onInitSuccess?(error?: any): void;

  /**
   * Gets the login status authenticating a user.
   * If a token expired or a user has not been authenticated at all the error throws.
   * To listen to the error use pass callback to `onAutoLoginSuccess` prop.
   * Normally, after the page reload a user have to click the login button again.
   * Having the prop enabled let authentication happens automatically.
   * To keep it works don't set `false` to `autoInit` and `autoLogin` props.
   */
  autoLogin?: boolean;

  /**
   * Gets called on login error if `autoLogin` enabled.
   * To keep it works don't set `false` to `autoInit` and `autoLogin` props.
   */
  onAutoLoginError?(error?: any): void;

  /**
   * Gets called on login error if `autoLogin` enabled
   * To keep it works don't set `false` to `autoInit` and `autoLogin` props.
   */
  onAutoLoginSuccess?(auth?: any): void;
}

/**
 * A React Context Provider component that passes into its context
 * unified social API methods and simplifies SDK initialization routine.
 */
const ImplicitAuthProvider: React.FC<ImplicitAuthProviderProps> = ({
  autoInit = true,
  autoLogin = true,
  children,
  config,
  onAutoLoginError = () => {},
  onAutoLoginSuccess = () => {},
  onInitError = () => {},
  onInitSuccess = () => {},
}) => {
  const adaptersApi = useMemo(() => createAdaptersApi(config), [config]);

  useEffect(() => {
    Object.keys(adaptersApi).forEach(
      async (provider: keyof typeof adaptersApi) => {
        const adapter = adaptersApi[provider];

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
