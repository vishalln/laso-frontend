import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import { cognitoConfig } from '@/config/cognito';
import { buildGoogleOAuthUrl, buildTokenExchangeUrl } from '@/constants/auth';

const VALID_ROLES = ['patient', 'doctor', 'coordinator', 'admin'] as const;

const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId: cognitoConfig.ClientId,
});

export interface CognitoAuthResult {
  success: boolean;
  session?: CognitoUserSession;
  error?: string;
}

export interface UserData {
  id: string;  // sub claim
  email: string;
  name?: string;
  role: string;  // extracted from cognito:groups
  groups: string[];
}

class CognitoService {
  // Authenticate user with email/password
  async login(email: string, password: string): Promise<CognitoAuthResult> {
    return new Promise((resolve) => {
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          resolve({ success: true, session });
        },
        onFailure: (err) => {
          resolve({ success: false, error: err.message });
        },
      });
    });
  }

  // Get current user session
  async getCurrentSession(): Promise<CognitoUserSession | null> {
    const sdkSession = await this.getSessionViaSdk();
    if (sdkSession?.isValid()) return sdkSession;
    return this.restoreSessionFromStorage();
  }

  private async getSessionViaSdk(): Promise<CognitoUserSession | null> {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) return null;

    return new Promise((resolve) => {
      currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        resolve(err || !session ? null : session);
      });
    });
  }

  private restoreSessionFromStorage(): CognitoUserSession | null {
    const keyPrefix = `CognitoIdentityServiceProvider.${cognitoConfig.ClientId}`;
    const lastAuthUser = localStorage.getItem(`${keyPrefix}.LastAuthUser`);
    if (!lastAuthUser) return null;

    const idToken = localStorage.getItem(`${keyPrefix}.${lastAuthUser}.idToken`);
    const accessToken = localStorage.getItem(`${keyPrefix}.${lastAuthUser}.accessToken`);
    const refreshToken = localStorage.getItem(`${keyPrefix}.${lastAuthUser}.refreshToken`);

    if (!idToken || !accessToken || !refreshToken) return null;

    try {
      const session = new CognitoUserSession({
        IdToken: new CognitoIdToken({ IdToken: idToken }),
        AccessToken: new CognitoAccessToken({ AccessToken: accessToken }),
        RefreshToken: new CognitoRefreshToken({ RefreshToken: refreshToken }),
      });
      return session.isValid() ? session : null;
    } catch {
      return null;
    }
  }

  // Get access token for API calls
  async getAccessToken(): Promise<string | null> {
    const session = await this.getCurrentSession();
    return session?.getAccessToken().getJwtToken() || null;
  }

  // Extract user data from token
  getUserDataFromSession(session: CognitoUserSession): UserData {
    const idToken = session.getIdToken();
    const payload = idToken.decodePayload();
    
    const allGroups: string[] = payload['cognito:groups'] || [];
    const roleGroup = allGroups.find(g => VALID_ROLES.includes(g.toLowerCase() as typeof VALID_ROLES[number]));
    const role = roleGroup?.toLowerCase() || 'patient';

    const name = payload.name || 
                 (payload.given_name && payload.family_name 
                   ? `${payload.given_name} ${payload.family_name}` 
                   : payload.given_name || payload.family_name) ||
                 payload.email?.split('@')[0] || 
                 'User';

    return {
      id: payload.sub,
      email: payload.email,
      name,
      role,
      groups: allGroups,
    };
  }

  // Logout
  logout(): void {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session?.isValid() || false;
  }

  initiateGoogleLogin(): void {
    const googleUrl = buildGoogleOAuthUrl(cognitoConfig.ClientId);
    window.location.href = googleUrl;
  }

  async handleOAuthCallback(code: string): Promise<CognitoAuthResult> {
    try {
      const tokenUrl = buildTokenExchangeUrl();
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: cognitoConfig.ClientId,
        code,
        redirect_uri: cognitoConfig.OAuth.redirectSignIn,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', errorText);
        throw new Error(`Failed to exchange authorization code: ${response.status} ${errorText}`);
      }

      const tokens = await response.json();
      
      // Store tokens in localStorage for the Cognito SDK
      const storage = window.localStorage;
      const keyPrefix = `CognitoIdentityServiceProvider.${cognitoConfig.ClientId}`;
      const lastAuthUser = tokens.id_token ? JSON.parse(atob(tokens.id_token.split('.')[1])).email : 'unknown';
      
      storage.setItem(`${keyPrefix}.LastAuthUser`, lastAuthUser);
      storage.setItem(`${keyPrefix}.${lastAuthUser}.idToken`, tokens.id_token);
      storage.setItem(`${keyPrefix}.${lastAuthUser}.accessToken`, tokens.access_token);
      storage.setItem(`${keyPrefix}.${lastAuthUser}.refreshToken`, tokens.refresh_token);
      storage.setItem(`${keyPrefix}.${lastAuthUser}.clockDrift`, '0');

      const session = this.createSessionFromTokens(tokens);

      return { success: true, session };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed',
      };
    }
  }

  private createSessionFromTokens(tokens: any): CognitoUserSession {
    const idToken = new CognitoIdToken({ IdToken: tokens.id_token });
    const accessToken = new CognitoAccessToken({ AccessToken: tokens.access_token });
    const refreshToken = new CognitoRefreshToken({ RefreshToken: tokens.refresh_token });

    return new CognitoUserSession({
      IdToken: idToken,
      AccessToken: accessToken,
      RefreshToken: refreshToken,
    });
  }
}

export const cognitoService = new CognitoService();
