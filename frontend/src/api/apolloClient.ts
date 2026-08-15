import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import keycloak from '../auth/keycloak';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
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
  // Refresh token if expiring soon
  if (keycloak.authenticated && keycloak.isTokenExpired(30)) {
    try {
      await keycloak.updateToken(30);
    } catch (err) {
      console.error('Failed to refresh token', err);
    }
  }

  let token = keycloak.token;
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
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default apolloClient;
