import loadSdk from '../utils/loadSdk';
import createStatus from '../utils/createStatus';
import { GoogleConfig } from './types';
import { Adapter, Events } from './types';
import createEmitter from './emitter';
import createAuth, { Auth } from '../utils/createAuth';
import createUserProfile from '../utils/createUserProfile';

const google: Adapter<GoogleConfig> = (
  { apiKey, clientId, discoveryDocs, scope: initialScope = 'profile email' },
  adapterId,
) => {
  const { on, off, emit, all } = createEmitter();

  const handleLogin = (
    event: Events.login | Events.autoLogin,
  ): Promise<Auth> => {
    return new Promise((resolve, reject) => {
      const GoogleAuth = window.gapi.auth2.getAuthInstance();

      if (!GoogleAuth.isSignedIn.get()) {
        return reject(
          createStatus({
            adapterId,
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
          adapterId,
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
                emit(event, gapi);
                resolve(gapi);
              } catch (error) {
                reject(
                  createStatus({
                    adapterId,
                    event,
                    message: error?.message,
                    type: 'error',
                  }),
                );
              }
            };

            gapi.load('client:auth2', init);
          },
          onerror() {
            reject(
              createStatus({
                adapterId,
                event,
                message: `Failed to load Google SDK.`,
                type: 'error',
              }),
            );
          },
        });
      });
    },

    /**
     * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#callinganapi
     */
    api({ path, method = 'GET', params = {}, body }) {
      const event = Events.api;

      return new Promise((resolve, reject) => {
        window.gapi.client
          .request({
            method,
            path,
            params,
            body,
          })
          .then(
            (response: {
              statusText: null | string;
              status: number;
              result: any;
              body: string;
              headers: any;
            }) => {
              const result = { data: response?.result };

              emit(event, result);
              resolve(result);
            },
          )
          .catch(
            (response: {
              body: string;
              headers: object;
              result: {
                error: {
                  message?: string;
                  status?: number;
                  code: number;
                };
              };
              status: number;
              statusText?: string | null;
            }) => {
              const errorStatus = createStatus({
                adapterId,
                event,
                message:
                  response?.result?.error?.message ??
                  response?.statusText ??
                  'Request error occurred.',
                status: response?.result?.error?.status ?? response?.status,
                type: 'error',
              });

              emit(event, errorStatus);
              reject(errorStatus);
            },
          );
      });
    },

    getUserProfile() {
      const event = Events.userProfile;

      return new Promise((resolve) => {
        const GoogleUser = window.gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile();

        const profile = createUserProfile({
          avatarUrl: GoogleUser.getImageUrl(),
          email: GoogleUser.getEmail(),
          firstName: GoogleUser.getGivenName(),
          id: GoogleUser.getId(),
          lastName: GoogleUser.getFamilyName(),
          name: GoogleUser.getName(),
        });

        emit(event, profile);
        resolve(profile);
      });
    },

    /**
     * @see https://developers.google.com/identity/sign-in/web/reference#gapiauth2getauthinstance
     */
    autoLogin() {
      const event = Events.autoLogin;

      return new Promise((resolve, reject) => {
        handleLogin(event)
          .then((auth) => {
            emit(event, auth);
            resolve(auth);
          })
          .catch((error) => {
            emit(Events.error, error);
            reject(error);
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
              .then((auth) => {
                emit(event, auth);
                resolve(auth);
              })
              .catch((error) => {
                emit(Events.error, error);
                reject(error);
              }),
          )
          .catch(({ error }: { error: string }) => {
            const errorStatus = createStatus({
              adapterId,
              event,
              message: 'Login error occurred.',
              status: error,
              type: 'error',
            });

            emit(event, errorStatus);
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
            .then((auth) => {
              emit(event, auth);
              resolve(auth);
            })
            .catch((error) => {
              emit(Events.error, error);
              reject(error);
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
            emit(event, null);
            resolve(null);
          })
          .catch(reject);
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
          .then((response: any) => {
            emit(event, response);
            resolve(response);
          })
          .catch(reject);
      });
    },
  };
};

export default google;
