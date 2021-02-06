import loadSdk from '../utils/loadSdk';
import createMethodResult from '../utils/createMethodResult';
import { AuthData, GoogleConfig } from './types';
import { Adapter, Events } from './types';
import createEmitter from './emitter';
import createAuth from '../utils/createAuth';
import createUserProfile from '../utils/createUserProfile';

interface GoogleApiResponse {
  statusText?: null | string;
  status?: number;
  result?:
    | {
        error: {
          message?: string;
          status?: number;
          code: number;
        };
      }
    | object;
  body?: string;
  headers?: any;
  message?: string;
}

const google: Adapter<GoogleConfig> = (
  { apiKey, clientId, discoveryDocs, scope: initialScope = 'profile email' },
  provider,
) => {
  const { on, off, emit, all } = createEmitter();

  const handleLogin = (
    event: Events.login | Events.autoLogin,
  ): Promise<AuthData> => {
    return new Promise((resolve, reject) => {
      const GoogleAuth = window.gapi.auth2.getAuthInstance();

      if (!GoogleAuth.isSignedIn.get()) {
        return reject(
          createMethodResult({
            provider,
            event,
            message: 'Not authenticated.',
            type: 'error',
          }),
        );
      }

      resolve(createAuth(GoogleAuth.currentUser.get().getAuthResponse()));
    });
  };

  return {
    on,
    off,
    emit,
    all,

    /**
     * @see https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientinitargs--
     * @see https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientloadurlorobject--
     * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#creatingclient
     * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#example
     * @see https://developers.google.com/identity/sign-in/web/reference#googleusergrantoptions
     * @see https://developers.google.com/identity/protocols/oauth2/scopes
     */
    init() {
      const event = Events.init;

      return new Promise((resolve, reject) => {
        loadSdk({
          provider,
          src: '//apis.google.com/js/api.js',
          onload() {
            const gapi = window.gapi;

            const init = async () => {
              try {
                await gapi.client.init({
                  apiKey,
                  clientId,
                  discoveryDocs,
                  scope: initialScope,
                });

                const successResult = createMethodResult({
                  data: gapi,
                  event,
                  provider,
                  type: 'success',
                });

                emit(event, successResult);
                resolve(successResult);
              } catch (error) {
                const errorResult = createMethodResult({
                  provider,
                  event,
                  message: error?.message ?? error?.details,
                  type: 'error',
                  status: error?.error,
                });

                emit(event, errorResult);
                reject(errorResult);
              }
            };

            gapi.load('client:auth2', init);
          },
          onerror() {
            const errorResult = createMethodResult({
              provider,
              event,
              message: `Failed to load Google SDK.`,
              type: 'error',
            });

            emit(event, errorResult);
            reject(errorResult);
          },
        });
      });
    },

    /**
     * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#callinganapi
     */
    api({ path, method = 'GET', params = {}, body }) {
      const event = Events.api;

      return new Promise(async (resolve, reject) => {
        try {
          const response: GoogleApiResponse = await window.gapi.client.request({
            method,
            path,
            params,
            body,
          });

          const successResult = createMethodResult({
            provider,
            data: response?.result,
            event,
            type: 'success',
          });

          emit(event, successResult);
          resolve(successResult);
        } catch (e) {
          const errorResult = createMethodResult({
            provider,
            event,
            message:
              e?.message ??
              e?.result?.error?.message ??
              e?.statusText ??
              'An unexpected error occurred.',
            status: e?.result?.error?.status ?? e?.status,
            type: 'error',
          });

          emit(Events.error, errorResult);
          reject(errorResult);
        }
      });
    },

    getUserProfile() {
      const event = Events.userProfile;

      return new Promise((resolve) => {
        const GoogleUser = window.gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile();
        const data = createUserProfile({
          avatarUrl: GoogleUser.getImageUrl(),
          email: GoogleUser.getEmail(),
          firstName: GoogleUser.getGivenName(),
          id: GoogleUser.getId(),
          lastName: GoogleUser.getFamilyName(),
          name: GoogleUser.getName(),
        });
        const successResult = createMethodResult({
          data,
          event,
          provider,
          type: 'success',
        });

        emit(event, successResult);
        resolve(successResult);
      });
    },

    /**
     * @see https://developers.google.com/identity/sign-in/web/reference#gapiauth2getauthinstance
     */
    autoLogin() {
      const event = Events.autoLogin;

      return new Promise((resolve, reject) => {
        handleLogin(event)
          .then((data) => {
            const successResult = createMethodResult({
              data,
              event,
              provider,
              type: 'success',
            });

            emit(event, successResult);
            resolve(successResult);
          })
          .catch((error) => {
            const errorResult = createMethodResult({
              data: error,
              event,
              message: error?.message ?? error?.details,
              provider,
              status: error?.error,
              type: 'error',
            });

            emit(Events.error, errorResult);
            reject(errorResult);
          });
      });
    },

    /**
     * Authorizes a user using default scope.
     * @see https://developers.google.com/identity/sign-in/web/reference#googleauthsignin
     * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#redirecting
     * @see https://developers.google.com/identity/protocols/oauth2/scopes#google-sign-in
     */
    login() {
      const event = Events.login;

      return new Promise((resolve, reject) => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();

        GoogleAuth.signIn()
          .then(() =>
            handleLogin(event)
              .then((data) => {
                const successResult = createMethodResult({
                  data,
                  event,
                  provider,
                  type: 'success',
                });

                emit(event, successResult);
                resolve(successResult);
              })
              .catch((error) => {
                const errorResult = createMethodResult({
                  data: error,
                  event,
                  message: error?.message ?? error?.details,
                  provider,
                  status: error?.error,
                  type: 'error',
                });

                emit(Events.error, errorResult);
                reject(errorResult);
              }),
          )
          .catch((error: any) => {
            const errorStatus = createMethodResult({
              data: error,
              event,
              message: 'Login error occurred.',
              provider,
              status: error?.error,
              type: 'error',
            });

            emit(Events.error, errorStatus);
            reject(errorStatus);
          });
      });
    },

    /**
     * @see https://developers.google.com/identity/sign-in/web/reference#googleusergrantoptions
     * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#incrementalAuth
     */
    grant(scope) {
      const event = Events.login;

      return new Promise((resolve, reject) => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();
        const GoogleUser = GoogleAuth.currentUser.get();

        GoogleUser.grant({ scope }).then(() =>
          handleLogin(event)
            .then((data) => {
              const successResult = createMethodResult({
                data,
                event,
                provider,
                type: 'success',
              });

              emit(event, successResult);
              resolve(successResult);
            })
            .catch((error) => {
              const errorStatus = createMethodResult({
                data: error,
                event,
                message: error?.error ?? error?.message,
                provider,
                status: error,
                type: 'error',
              });

              emit(Events.error, errorStatus);
              reject(errorStatus);
            }),
        );
      });
    },

    /**
     * @see https://developers.google.com/api-client-library/javascript/reference/referencedocs#googleauthsignout
     */
    logout() {
      const event = Events.logout;

      return new Promise((resolve, reject) => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();

        GoogleAuth.signOut()
          .then(() => {
            const successResult = createMethodResult({
              data: null,
              event,
              provider,
              type: 'success',
            });

            emit(event, successResult);
            resolve(successResult);
          })
          .catch((error: any) => {
            const errorStatus = createMethodResult({
              data: error,
              event,
              message: error?.message,
              provider,
              status: error,
              type: 'error',
            });

            emit(Events.error, errorStatus);
            reject(errorStatus);
          });
      });
    },

    /**
     * @see https://developers.google.com/api-client-library/javascript/reference/referencedocs#googleauthsignout
     */
    revoke() {
      const event = Events.revoke;

      return new Promise((resolve, reject) => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();

        GoogleAuth.disconnect()
          .then((data: any) => {
            const successResult = createMethodResult({
              data,
              event,
              provider,
              type: 'success',
            });

            emit(event, successResult);
            resolve(successResult);
          })
          .catch((error: any) => {
            const errorStatus = createMethodResult({
              data: error,
              event,
              message: error?.error ?? error?.message,
              provider,
              status: error,
              type: 'error',
            });

            emit(Events.error, errorStatus);
            reject(errorStatus);
          });
      });
    },
  };
};

export default google;
