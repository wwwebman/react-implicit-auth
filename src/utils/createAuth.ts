import { AuthData } from 'src/adapters/types';

const createAuth = (data: any): AuthData => {
  return {
    expiresAt: data?.data_access_expiration_time ?? data?.expires_at,
    expiresIn: data?.expiresIn ?? data?.expires_in,
    grantedScopes: data?.grantedScopes ?? data?.scope,
    token: data?.accessToken ?? data?.access_token,
  };
};

export default createAuth;
