import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import keycloak from '../auth/keycloak';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

const authLink = setContext(async (_, { headers }) => {
  // Refresh token if expiring soon
  if (keycloak.isTokenExpired(30)) {
    await keycloak.updateToken(30);
  }

  const token = keycloak.token;

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
