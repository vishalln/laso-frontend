export const COGNITO_DOMAIN = "laso-health.auth.ap-south-1.amazoncognito.com";
export const COGNITO_REGION = "ap-south-1";

export const OAUTH_PROVIDER = {
  GOOGLE: "Google",
  COGNITO: "COGNITO",
} as const;

export const OAUTH_SCOPES = ["openid", "email", "profile"];

export const OAUTH_ENDPOINTS = {
  AUTHORIZE: "/oauth2/authorize",
  TOKEN: "/oauth2/token",
  LOGOUT: "/logout",
} as const;

export const OAUTH_RESPONSE_TYPE = "code";

export const getOAuthConfig = () => ({
  domain: COGNITO_DOMAIN,
  scope: OAUTH_SCOPES,
  redirectSignIn: import.meta.env.VITE_OAUTH_REDIRECT_URI || "http://localhost:5173/auth/callback",
  redirectSignOut: import.meta.env.VITE_OAUTH_LOGOUT_URI || "http://localhost:5173/login",
  responseType: OAUTH_RESPONSE_TYPE,
});

export const buildGoogleOAuthUrl = (clientId: string): string => {
  const config = getOAuthConfig();
  const params = new URLSearchParams({
    identity_provider: OAUTH_PROVIDER.GOOGLE,
    client_id: clientId,
    response_type: config.responseType,
    scope: config.scope.join(" "),
    redirect_uri: config.redirectSignIn,
  });
  
  return `https://${config.domain}${OAUTH_ENDPOINTS.AUTHORIZE}?${params.toString()}`;
};

export const buildTokenExchangeUrl = (): string => {
  return `https://${COGNITO_DOMAIN}${OAUTH_ENDPOINTS.TOKEN}`;
};
