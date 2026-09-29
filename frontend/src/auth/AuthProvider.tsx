import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import keycloak from './keycloak';
import { useApolloClient, gql } from '@apollo/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  /**
   * Returns a token guaranteed valid for the next 30s, refreshing it first if
   * needed. Access tokens live ~5 minutes, so long-lived admin screens must call
   * this per request rather than reusing the `token` captured at render time.
   */
  getToken: () => Promise<string | undefined>;
  userInfo: {
    name?: string;
    email?: string;
    sub?: string;
    preferred_username?: string;
    realm_roles?: string[];
    given_name?: string;
    family_name?: string;
    role?: string;
    id?: string;
  } | null;
  logout: () => void;
  login: (redirectUri?: string) => void;
  register: (redirectUri?: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const SYNC_USER_MUTATION = gql`
  mutation SyncUser {
    syncUser {
      id
      keycloakSub
      name
    }
  }
`;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<AuthContextType['userInfo']>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const isRun = React.useRef(false);
  const apolloClient = useApolloClient();

  const getToken = useCallback(async () => {
    if (!keycloak.authenticated) return undefined;
    try {
      await keycloak.updateToken(30);
    } catch {
      return undefined;
    }
    setToken(keycloak.token);
    return keycloak.token;
  }, []);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        setToken(keycloak.token);
        if (authenticated && keycloak.tokenParsed) {
          setUserInfo({
            name: keycloak.tokenParsed['name'],
            email: keycloak.tokenParsed['email'],
            sub: keycloak.tokenParsed['sub'],
            preferred_username: keycloak.tokenParsed['preferred_username'],
            realm_roles: keycloak.tokenParsed['realm_access']?.roles || [],
          });

          // Automatically sync user to local database
          apolloClient.mutate({
            mutation: SYNC_USER_MUTATION,
          }).catch((err) => console.error('Failed to sync user with DB:', err));
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    // Auto-refresh token 30 seconds before expiry. Publishing the refreshed token
    // to state is what keeps `useAuth().token` from going stale: without it every
    // consumer keeps sending the first token until a full page reload.
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30)
        .then(() => setToken(keycloak.token))
        .catch(() => {
          keycloak.logout();
        });
    };

    keycloak.onAuthRefreshSuccess = () => setToken(keycloak.token);
    keycloak.onAuthSuccess = () => setToken(keycloak.token);
    keycloak.onAuthLogout = () => setToken(undefined);
  }, []);

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin + '/' });
  };

  const login = (redirectUri?: string) => {
    keycloak.login({ redirectUri: redirectUri || window.location.origin + '/', prompt: 'login' });
  };

  const register = (redirectUri?: string) => {
    keycloak.register({ redirectUri: redirectUri || window.location.origin + '/', prompt: 'login' });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        getToken,
        userInfo,
        logout,
        login,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
