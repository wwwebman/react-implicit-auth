export interface Auth {
  expiresAt: string;
  expiresIn: string;
  grantedScopes: string;
  token: string;
}

const createAuth = (data: any): Auth => {
  return {
    expiresAt: data?.data_access_expiration_time ?? data?.expires_at,
    expiresIn: data?.expiresIn ?? data?.expires_in,
    grantedScopes: data?.grantedScopes ?? data?.scope,
    token: data?.accessToken ?? data?.access_token,
  };
};

export default createAuth;
