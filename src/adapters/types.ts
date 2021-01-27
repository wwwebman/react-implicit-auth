import { EventHandlerMap, Handler, WildcardHandler } from 'mitt';

export interface AuthData {
  expiresAt: string;
  expiresIn: string;
  grantedScopes: string;
  token: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  name: string;
  avatarUrl: string;
}

export enum Events {
  api = 'api',
  autoLogin = 'autoLogin',
  error = 'error',
  init = 'init',
  login = 'login',
  logout = 'logout',
  revoke = 'revoke',
  userProfile = 'userProfile',
}

export enum Methods {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
}

export type AdapterId = 'facebook' | 'google';

export interface Config {
  debug?: boolean;
  lang?: string;
  scope?: string;
}

/**
 * @see https://developers.facebook.com/docs/javascript/reference/FB.init
 */
export interface FbConfig extends Config {
  appId: string;
  cookie?: boolean;
  status?: boolean;
  version: string;
  xfbml?: boolean;
}

/**
 * @see https://developers.google.com/identity/sign-in/web/reference#gapiauth2clientconfig
 */
export interface GoogleConfig extends Config {
  apiKey?: string;
  clientId: string;
  discoveryDocs?: string;
}

export interface Configs {
  facebook?: FbConfig;
  google?: GoogleConfig;
}

interface ApiRequestOptions {
  path: string;
  method?: keyof typeof Methods;
  params?: object;
  body?: string | object;
}

export interface AdapterMethods {
  /**
   * Allows to make requests to provider API.
   * @returns Promise => any data depends on provider API it requests.
   */
  api(args?: ApiRequestOptions): Promise<{ data: any }>;

  /**
   * Gets login status on page init and allows to authenticate users
   * automatically if a token has not been expired.
   * @returns Promise =>
   * {expiresAt: string; expiresIn: string; grantedScopes: string; token: string;}
   */
  autoLogin(): Promise<AuthData>;

  /**
   * Retrieves authenticated user profile.
   * @returns Promise =>
   * {email: string; firstName: string; id: string; lastName: string; name: string; avatarUrl: string;}
   */
  getUserProfile(): Promise<UserProfile>;

  /**
   * Extends authorization scope. The difference between login() and grant()
   * is that the first one uses the scope defined in Configs object.
   * Using this method it's possible to set different scope then defined
   * in the initial config.
   * @returns Promise =>
   * {email: string; firstName: string; id: string; lastName: string; name: string; avatarUrl: string;}
   */
  grant(scope: string): Promise<AuthData>;

  /**
   * Initialize SDK provider script using config object.
   * @returns Particular SDK library object.
   */
  init(): Promise<object>;

  /**
   * Calls provider login.
   * @returns Promise =>
   * {expiresAt: string; expiresIn: string; grantedScopes: string; token: string;}
   */
  login(): Promise<AuthData>;

  /**
   * Calls provider logout.
   * @returns Promise =>
   * {expiresAt: string; expiresIn: string; grantedScopes: string; token: string;}
   */
  logout(): Promise<null>;

  /**
   * Revoking login, de-authorize an app.
   */
  revoke(permissions?: string): Promise<any>;
}

export interface AdapterEmitter {
  all: EventHandlerMap;
  on(type: '*', handler: WildcardHandler): void;
  on<T = any>(type: keyof typeof Events, handler: Handler<T>): void;
  off<T = any>(type: keyof typeof Events, handler: Handler<T>): void;
  off(type: '* ', handler: WildcardHandler): void;
  emit(type: '*', event?: any): void;
  emit<T = any>(type: keyof typeof Events, event?: T): void;
}

export type AdapterApi = AdapterMethods & AdapterEmitter;

export type Adapter<T = any> = (config: T, adapterId: AdapterId) => AdapterApi;

export interface Adapters {
  facebook?: Adapter;
  google?: Adapter;
}

export type AdaptersApi = Partial<Record<AdapterId, AdapterApi>>;
