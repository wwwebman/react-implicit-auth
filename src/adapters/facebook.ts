import { Adapter, AuthData, MethodResult } from './types';
import createEmitter from './emitter';
import { FbConfig, Events } from './types';

import createAuth from '../utils/createAuth';
import createMethodResult from '../utils/createMethodResult';
import createUserProfile from '../utils/createUserProfile';
import loadSdk from '../utils/loadSdk';
import messages from '../utils/messages';

export interface FbApiResponse {
  data: any;
  error?: {
    code: number;
    error_subcode: number;
    error_user_msg: string;
    error_user_title: string;
    fbtrace_id: string;
    message?: string;
    status: number;
    type: string;
  };
  method?: 'get' | 'post' | 'delete';
  params?: object;
  path?: string;
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
  provider,
) => {
  const { on, off, emit, all } = createEmitter();
  const sdkSrc = debug
    ? `//connect.facebook.net/${lang}/sdk/debug.js`
    : `//connect.facebook.net/${lang}/sdk.js`;

  const createLoginResult = (
    event: string,
    { status, authResponse }: FbAuthResponse,
  ): MethodResult<AuthData> => {
    if (status !== 'connected' || !authResponse) {
      const error = Error(messages[status]);
      error.message = messages[status];
      (error as any).status = status;

      throw error;
    }

    return createMethodResult({
      data: createAuth(authResponse),
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
      message: error?.message ?? messages.unexpected,
      status: error?.status,
      type: 'error',
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
          provider,
          src: sdkSrc,
          onload() {
            const FB = window.FB;

            emit(event, FB);
            resolve(FB);
            FB.init({ appId, cookie, version, xfbml });
          },
          onerror() {
            const errorResult = createMethodErrorResult(event, {
              message: messages.sdk_load_failed,
            });

            emit(event, errorResult);
            reject(errorResult);
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
        window.FB.api(path, method, params, (response: FbApiResponse) => {
          if (!response || response.error) {
            const errorStatus = createMethodResult({
              data: response.error,
              event,
              message: response?.error?.message ?? messages.unexpected,
              provider,
              status: response.error.status,
              type: 'error',
            });

            emit(Events.error, errorStatus);
            return reject(errorStatus);
          }

          const successResponse = createMethodResult({
            data: response,
            event,
            provider,
            type: 'success',
          });

          emit(event, successResponse);
          resolve(successResponse);
        });
      });
    },

    getUserProfile() {
      const event = Events.userProfile;

      return new Promise(async (resolve, reject) => {
        try {
          const data = await this.api({
            path: 'me',
            params: { fields: 'email,name,id,first_name,last_name,picture' },
          });

          const successResult = createMethodResult({
            data: createUserProfile(data.data),
            event,
            provider,
            type: 'success',
          });

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = { ...error, event };

          reject(errorResult);
          emit(Events.error, errorResult);
        }
      });
    },

    /**
     * @see https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
     */
    autoLogin() {
      const event = Events.autoLogin;

      return new Promise((resolve, reject) => {
        window.FB.getLoginStatus((response: FbAuthResponse) => {
          try {
            const successResult = createLoginResult(event, response);

            emit(event, successResult);
            resolve(successResult);
          } catch (error) {
            const errorResult = createMethodErrorResult(event, error);

            emit(Events.error, errorResult);
            reject(errorResult);
          }
        });
      });
    },

    /**
     * @see https://developers.facebook.com/docs/reference/javascript/FB.login
     */
    login() {
      const event = Events.login;

      return new Promise((resolve, reject) => {
        window.FB.login(
          (response: FbAuthResponse) => {
            try {
              const successResult = createLoginResult(event, response);

              emit(event, successResult);
              resolve(successResult);
            } catch (error) {
              const errorResult = createMethodErrorResult(event, error);

              emit(Events.error, errorResult);
              reject(errorResult);
            }
          },
          {
            scope: initialScope,
            return_scopes: true,
          },
        );
      });
    },

    /**
     * @see https://developers.facebook.com/docs/reference/javascript/FB.login
     */
    grant({ scope }) {
      const event = Events.grant;

      return new Promise((resolve, reject) => {
        window.FB.login(
          (response: FbAuthResponse) => {
            try {
              const successResult = createLoginResult(event, response);

              emit(event, successResult);
              resolve(successResult);
            } catch (error) {
              const errorResult = createMethodErrorResult(event, error);

              emit(Events.error, errorResult);
              reject(errorResult);
            }
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
          const successResult = createMethodResult({
            data: null,
            event,
            provider,
            type: 'success',
          });

          emit(event, successResult);
          resolve(successResult);
        });
      });
    },

    /**
     * @see https://developers.facebook.com/docs/facebook-login/permissions/requesting-and-revoking
     */
    revoke() {
      const event = Events.revoke;

      return new Promise(async (resolve, reject) => {
        try {
          await this.api({
            path: `me/permissions`,
            method: 'DELETE',
          });

          const successResult = createMethodResult({
            data: null,
            event,
            provider,
            type: 'success',
          });

          emit(event, successResult);
          resolve(successResult);
        } catch (error) {
          const errorResult = { ...error, event };

          reject(errorResult);
          emit(Events.error, errorResult);
        }
      });
    },
  };
};

export default facebook;
