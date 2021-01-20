import { Adapter } from './types';
import createEmitter from './emitter';
import { FbConfig, Events } from './types';

import createAuth, { Auth } from '../utils/createAuth';
import createUserProfile from '../utils/createUserProfile';
import createStatus from '../utils/createStatus';
import loadSdk from '../utils/loadSdk';

export interface FbErrorResponse {
  error?: { message?: string };
}

export interface FbApiResponse {
  [key: string]: any;
}

export interface FbAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  } | null;
}

export interface FbApiResponse {
  method?: 'get' | 'post' | 'delete';
  params?: object;
  path: string;
}

const facebook: Adapter<FbConfig> = (
  {
    appId,
    cookie,
    debug,
    lang = 'en_US',
    scope: initialScope = 'public_profile,email',
    version,
    xfbml,
  },
  adapterId,
) => {
  const { on, off, emit, all } = createEmitter();
  const sdkSrc = debug
    ? `//connect.facebook.net/${lang}/sdk/debug.js`
    : `//connect.facebook.net/${lang}/sdk.js`;

  const handleLogin = (
    { status, authResponse }: FbAuthResponse,
    event: Events.login | Events.autoLogin,
  ): Promise<Auth> => {
    return new Promise((resolve, reject) => {
      if (status === 'connected' && authResponse) {
        return resolve(createAuth(authResponse));
      }

      const messages = {
        connected: 'Connected.',
        not_authorized: "The user hasn't authorized the application.",
        unknown: "The user isn't logged or an unknown error occurred.",
      };

      return reject(
        createStatus({
          adapterId,
          event,
          message: messages[status],
          status,
          type: 'error',
        }),
      );
    });
  };

  return {
    all,
    off,
    on,
    emit,

    /**
     * @see https://developers.facebook.com/docs/javascript/reference/FB.init
     */
    init() {
      const event = Events.init;

      return new Promise((resolve, reject) => {
        loadSdk({
          adapterId,
          src: sdkSrc,
          onload() {
            const FB = window.FB;

            emit(event, FB);
            resolve(FB);
            FB.init({ appId, cookie, version, xfbml });
          },
          onerror() {
            const errorStatus = createStatus({
              adapterId,
              event,
              message: 'Failed to load Facebook window.FB.',
              type: 'error',
            });

            emit(Events.error, errorStatus);
            reject(errorStatus);
          },
        });
      });
    },

    /**
     * @see https://developers.facebook.com/docs/javascript/reference/FB.api
     */
    api({ path, method = 'GET', params = {} }) {
      const event = Events.api;

      return new Promise((resolve, reject) => {
        window.FB.api(
          path,
          method,
          params,
          (response: FbApiResponse & FbErrorResponse) => {
            const result = { data: response?.data ?? response };

            if (!response || response.error) {
              const errorStatus = createStatus({
                adapterId,
                event,
                message: response?.error?.message ?? 'Request error occurred.',
                type: 'error',
              });

              emit(Events.error, errorStatus);
              return reject(errorStatus);
            }

            emit(event, result);
            resolve(result);
          },
        );
      });
    },

    getUserProfile() {
      const event = Events.userProfile;

      return new Promise((resolve, reject) => {
        this.api({
          path: 'me',
          params: { fields: 'email,name,id,first_name,last_name,picture' },
        }).then(({ data }) => {
          const profile = createUserProfile(data);

          emit(event, profile);
          resolve(profile);
        }, reject);
      });
    },

    /**
     * @see https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
     */
    autoLogin() {
      const event = Events.autoLogin;

      return new Promise((resolve, reject) => {
        window.FB.getLoginStatus((response: FbAuthResponse) => {
          handleLogin(response, event)
            .then((auth) => {
              emit(event, auth);
              resolve(auth);
            })
            .catch((error) => {
              emit(Events.error, error);
              reject(error);
            });
        });
      });
    },

    /**
     * Authorizes a user using default scope.
     * @see https://developers.facebook.com/docs/reference/javascript/FB.login
     */
    login() {
      const event = Events.login;

      return new Promise((resolve, reject) => {
        window.FB.login(
          (response: FbAuthResponse) => {
            handleLogin(response, event)
              .then((auth) => {
                emit(event, auth);
                resolve(auth);
              })
              .catch((error) => {
                emit(Events.error, error);
                reject(error);
              });
          },
          {
            scope: initialScope,
            return_scopes: true,
          },
        );
      });
    },

    /**
     * Authorizes a user using default scope.
     * @see https://developers.facebook.com/docs/reference/javascript/FB.login
     */
    grant(scope) {
      const event = Events.login;

      return new Promise((resolve, reject) => {
        window.FB.login(
          (response: FbAuthResponse) => {
            handleLogin(response, event)
              .then((auth) => {
                emit(event, auth);
                resolve(auth);
              })
              .catch((error) => {
                emit(Events.error, error);
                reject(error);
              });
          },
          {
            scope,
            return_scopes: true,
          },
        );
      });
    },

    /**
     * @see https://developers.facebook.com/docs/reference/javascript/FB.logout
     */
    logout() {
      const event = Events.logout;

      return new Promise((resolve) => {
        window.FB.logout(() => {
          resolve(null);
          emit(event, null);
        });
      });
    },

    /**
     * Revoking login, de-authorize an app.
     * @see https://developers.facebook.com/docs/facebook-login/permissions/requesting-and-revoking
     */
    revoke(permissionName) {
      const event = Events.revoke;

      return new Promise((resolve, reject) => {
        this.api({
          path: `me/permissions/${permissionName}`,
          method: 'DELETE',
        })
          .then((response) => {
            emit(event, response);
            resolve(response);
          })
          .catch(reject);
      });
    },
  };
};

export default facebook;
