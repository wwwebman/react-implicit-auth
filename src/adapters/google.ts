import loadSdk from '../utils/loadSdk';
import createMethodResult from '../utils/createMethodResult';
import { AuthData, GoogleConfig, MethodResult } from './types';
import { Adapter, Events } from './types';
import createEmitter from './emitter';
import createAuth from '../utils/createAuth';
import createUserProfile from '../utils/createUserProfile';
import messages from '../utils/messages';

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
  details?: string;
  headers?: any;
  message?: string;
}

const google: Adapter<GoogleConfig> = (
  { apiKey, clientId, discoveryDocs, scope: initialScope = 'profile email' },
  provider,
) => {
  const { on, off, emit, all } = createEmitter();

  const createLoginResult = (event: string): MethodResult<AuthData> => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();

    if (!GoogleAuth.isSignedIn.get()) {
      const error = Error(messages.not_authenticated);
      error.message = messages.not_authenticated;

      throw error;
    }

    return createMethodResult({
      data: createAuth(GoogleAuth.currentUser.get().getAuthResponse()),
      event,
      provider,
      type: 'success',
    });
  };

  const createMethodErrorResult = (event: Events, error: any) => {
    return createMethodResult({
      data: error,
      provider,
      event,
      message:
        error?.message ??
        error?.details ??
        error?.result?.error?.message ??
        error?.statusText ??
        messages.unexpected,
      status: error?.result?.error?.status ?? error?.status ?? error?.error,
      type: 'error',
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
            const init = async () => {
              try {
                await window.gapi.client.init({
                  apiKey,
                  clientId,
                  discoveryDocs,
                  scope: initialScope,
                });

                const successResult = createMethodResult({
                  data: window.gapi,
                  event,
                  provider,
                  type: 'success',
                });

                emit(event, successResult);
                resolve(successResult);
              } catch (error) {
                const errorResult = createMethodErrorResult(event, error);

                emit(event, errorResult);
                reject(errorResult);
              }
            };

            window.gapi.load('client:auth2', init);
          },
          onerror() {
            const errorResult = createMethodResult({
              data: null,
              event,
              message: messages.sdk_load_failed,
              provider,
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
     * @see https://developers.google.com/apis-explorer
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
        } catch (error) {
          const errorResult = createMethodErrorResult(event, error);

          emit(Events.error, errorResult);
          reject(errorResult);
        }
      });
    },

    getUserProfile() {
      const event = Events.userProfile;

      return new Promise((resolve, reject) => {
        try {
          const GoogleUser = window.gapi.auth2
            .getAuthInstance()
            .currentUser.get()
            .getBasicProfile();
          const successResult = createMethodResult({
            data: createUserProfile({
              avatarUrl: GoogleUser.getImageUrl(),
              email: GoogleUser.getEmail(),
              firstName: GoogleUser.getGivenName(),
              id: GoogleUser.getId(),
              lastName: GoogleUser.getFamilyName(),
              name: GoogleUser.getName(),
            }),
            event,
            provider,
            type: 'success',
          });

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = createMethodResult({
            data: { error: error.message },
            event,
            message: messages.unknown,
            provider,
            type: 'error',
          });

          emit(event, errorResult);
          reject(errorResult);
        }
      });
    },

    /**
     * @see https://developers.google.com/identity/sign-in/web/reference#gapiauth2getauthinstance
     */
    autoLogin() {
      const event = Events.autoLogin;

      return new Promise((resolve, reject) => {
        try {
          const successResult = createLoginResult(event);

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = createMethodErrorResult(event, error);

          emit(Events.error, errorResult);
          reject(errorResult);
        }
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

      return new Promise(async (resolve, reject) => {
        try {
          const GoogleAuth = window.gapi.auth2.getAuthInstance();
          await GoogleAuth.signIn();
          const successResult = createLoginResult(event);

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = createMethodErrorResult(event, error);

          emit(Events.error, errorResult);
          reject(errorResult);
        }
      });
    },

    /**
     * @see https://developers.google.com/identity/sign-in/web/reference#googleusergrantoptions
     * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#incrementalAuth
     */
    grant({ scope }) {
      const event = Events.grant;

      return new Promise(async (resolve, reject) => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();
        const GoogleUser = GoogleAuth.currentUser.get();

        try {
          await GoogleUser.grant({ scope });
          const successResult = createLoginResult(event);

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = createMethodErrorResult(event, error);

          emit(Events.error, errorResult);
          reject(errorResult);
        }
      });
    },

    /**
     * @see https://developers.google.com/api-client-library/javascript/reference/referencedocs#googleauthsignout
     */
    logout() {
      const event = Events.logout;

      return new Promise(async (resolve, reject) => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();

        try {
          await GoogleAuth.signOut();
          const successResult = createMethodResult({
            data: null,
            event,
            provider,
            type: 'success',
          });

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = createMethodErrorResult(event, error);

          emit(Events.error, errorResult);
          reject(errorResult);
        }
      });
    },

    /**
     * @see https://developers.google.com/api-client-library/javascript/reference/referencedocs#googleauthsignout
     */
    revoke() {
      const event = Events.revoke;

      return new Promise(async (resolve, reject) => {
        const GoogleAuth = window.gapi.auth2.getAuthInstance();

        try {
          await GoogleAuth.disconnect();
          const successResult = createMethodResult({
            data: null,
            event,
            provider,
            type: 'success',
          });

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = createMethodErrorResult(event, error);

          emit(Events.error, errorResult);
          reject(errorResult);
        }
      });
    },
  };
};

export default google;
