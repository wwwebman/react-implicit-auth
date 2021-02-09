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

interface ProviderSdk {
  [key: string]: any;
}

export enum Events {
  api = 'api',
  autoLogin = 'autoLogin',
  error = 'error',
  grant = 'grant',
  init = 'init',
  login = 'login',
  logout = 'logout',
  reInit = 'reInit',
  revoke = 'revoke',
  userProfile = 'userProfile',
}

export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
}

export type Provider = 'facebook' | 'google';

export interface ProviderConfig {
  debug?: boolean;
  lang?: string;
  scope?: string;
}

export interface FbConfig extends ProviderConfig {
  appId: string;
  cookie?: boolean;
  status?: boolean;
  version: string;
  xfbml?: boolean;
}

export interface GoogleConfig extends ProviderConfig {
  apiKey?: string;
  clientId: string;
  discoveryDocs?: string;
}

export interface Config {
  facebook?: FbConfig;
  google?: GoogleConfig;
}

interface ApiRequestOptions {
  path: string;
  method?: keyof typeof HttpMethods;
  params?: object;
  body?: string | object;
}

export interface MethodResult<TData = any> {
  provider: Provider;
  data: TData;
  event: string;
  message?: string;
  status?: string | number;
  type: 'error' | 'success';
}

export interface AdapterMethods {
  /**
   * Allows to make requests to provider API.
   */
  api(args?: ApiRequestOptions): Promise<MethodResult>;

  /**
   * Gets login status on page init and allows to authenticate users
   * automatically if a token has not been expired.
   */
  autoLogin(): Promise<MethodResult<AuthData>>;

  /**
   * Retrieves authenticated user profile.
   */
  getUserProfile(): Promise<MethodResult<UserProfile>>;

  /**
   * Extends authorization scope. The difference between login() and grant()
   * is that the first one uses the scope defined in Config object.
   * Using this method it's possible to set different scope then defined
   * in the initial config.
   */
  grant({ scope }: { scope: string }): Promise<MethodResult<AuthData>>;

  /**
   * Initialize SDK provider script using config object.
   */
  init(): Promise<MethodResult<ProviderSdk>>;

  /**
   * Calls provider login.
   */
  login(): Promise<MethodResult<AuthData>>;

  /**
   * Calls provider logout.
   */
  logout(): Promise<MethodResult<null>>;

  /**
   * De-authorizes app revoking all of the scopes the user granted.
   */
  revoke(): Promise<MethodResult>;
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

export type Adapter<T = any> = (
  config: T,
  provider: Provider,
) => AdapterMethods & AdapterEmitter;

export interface Adapters {
  facebook?: Adapter;
  google?: Adapter;
}

export type AdaptersApi = Partial<
  Record<Provider, AdapterMethods & AdapterEmitter>
>;
