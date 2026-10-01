import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import keycloak from '../auth/keycloak';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

const retryLink = new RetryLink({
  delay: {
    initial: 1000,
    max: 10000,
    jitter: true,
  },
  attempts: {
    max: 10,
    retryIf: (error, _operation) => {
      // Retry if it's a network error (TypeError: Failed to fetch)
      if (error && error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return true;
      }
      // Or retry if it's a 5xx server error
      if (error && error.statusCode >= 500) {
        return true;
      }
      // Don't retry on GraphQL validation errors or 4xx errors
      return !!error && !error.statusCode;
    },
  },
});

let cachedGuestToken: string | null = null;
let guestTokenExpiry: number | null = null;
let guestTokenPromise: Promise<string | null> | null = null;

export async function getGuestToken(): Promise<string | null> {
  const now = Date.now();
  // Return cached token if still valid
  if (cachedGuestToken && guestTokenExpiry && now < guestTokenExpiry) {
    return cachedGuestToken;
  }
  // If a fetch is already in-flight, reuse it (prevents duplicate 429s)
  if (guestTokenPromise) {
    return guestTokenPromise;
  }
  guestTokenPromise = fetch('/api/guest-token')
    .then(res => {
      if (!res.ok) return null;
      return res.json();
    })
    .then(data => {
      if (!data?.token) return null;
      cachedGuestToken = data.token;
      guestTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
      return cachedGuestToken;
    })
    .catch(err => {
      console.error('Failed to get guest token', err);
      return null;
    })
    .finally(() => {
      guestTokenPromise = null; // Allow retry next time
    });
  return guestTokenPromise;
}

const authLink = setContext(async (_, { headers }) => {
  // First, check if there's a custom local token for standard users
  let token = localStorage.getItem('ceylonica_user_token');

  if (!token) {
    // If no local token, check Keycloak
    if (keycloak.authenticated && keycloak.isTokenExpired(30)) {
      try {
        await keycloak.updateToken(30);
      } catch (err) {
        console.error('Failed to refresh token', err);
      }
    }
    token = keycloak.token || null;
  }

  if (!token) {
    token = (await getGuestToken()) || undefined;
  }

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    },
  };
});

const apolloClient = new ApolloClient({
  link: ApolloLink.from([retryLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default apolloClient;
