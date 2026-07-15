import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak from './keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  userInfo: {
    name?: string;
    email?: string;
    sub?: string;
    preferred_username?: string;
    realm_roles?: string[];
  } | null;
  logout: () => void;
  login: () => void;
  register: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<AuthContextType['userInfo']>(null);
  const isRun = React.useRef(false);

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
        if (authenticated && keycloak.tokenParsed) {
          setUserInfo({
            name: keycloak.tokenParsed['name'],
            email: keycloak.tokenParsed['email'],
            sub: keycloak.tokenParsed['sub'],
            preferred_username: keycloak.tokenParsed['preferred_username'],
            realm_roles: keycloak.tokenParsed['realm_access']?.roles || [],
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    // Auto-refresh token 30 seconds before expiry
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => {
        keycloak.logout();
      });
    };
  }, []);

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin + '/' });
  };

  const login = () => {
    keycloak.login({ redirectUri: window.location.origin + '/' });
  };

  const register = () => {
    keycloak.register({ redirectUri: window.location.origin + '/' });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token: keycloak.token,
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
