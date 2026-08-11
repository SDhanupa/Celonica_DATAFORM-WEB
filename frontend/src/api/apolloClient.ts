import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import keycloak from '../auth/keycloak';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

let cachedGuestToken: string | null = null;
let guestTokenExpiry: number | null = null;

export async function getGuestToken() {
  const now = Date.now();
  if (cachedGuestToken && guestTokenExpiry && now < guestTokenExpiry) {
    return cachedGuestToken;
  }
  try {
    const res = await fetch('/api/guest-token');
    if (!res.ok) return null;
    const data = await res.json();
    cachedGuestToken = data.token;
    guestTokenExpiry = now + (data.expires_in * 1000) - 60000;
    return cachedGuestToken;
  } catch (err) {
    console.error('Failed to get guest token', err);
    return null;
  }
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
