import { EventHandlerMap, Handler, WildcardHandler } from 'mitt';

import { Auth } from '../utils/createAuth';
import { UserProfile } from '../utils/createUserProfile';

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
  api(args?: ApiRequestOptions): Promise<{ data: any }>;
  autoLogin(): Promise<Auth>;
  getUserProfile(): Promise<UserProfile>;
  grant(scope: string): Promise<Auth>;
  init(): Promise<object>;
  login(): Promise<Auth>;
  logout(): Promise<null>;
  revoke(arg?: string): Promise<any>;
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
