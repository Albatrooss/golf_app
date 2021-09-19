import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  gql,
  createHttpLink,
} from '@apollo/client';
// import Rollbar from 'rollbar';
import 'cross-fetch/polyfill';
import { renderToStringWithData } from '@apollo/client/react/ssr';
import { StaticRouter } from 'react-router';
import { AuthContextType } from '@/contexts';
// import { Provider } from '@rollbar/react';
import { CacheProvider, extractEmotion } from './utils/ssr-css';
// import typePolicies from './typePolicies';
import App from './App';

export type SSR = typeof ssr;

interface SSROptions {
  graphQLUrl: string;
  cookie: string;
  route: string;
  query: Record<string, string>;
  template: string;
  userContext?: AuthContextType['auth'];
  wsJwt?: string;
  // rollbarConfig?: Rollbar.Configuration;
}

export const ssr = async ({
  graphQLUrl,
  cookie,
  route,
  query,
  template,
  userContext,
  wsJwt,
}: // rollbarConfig,
SSROptions) => {
  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: graphQLUrl,
      credentials: 'include',
      headers: { cookie },
    }),
    cache: new InMemoryCache({
      // typePolicies,
      addTypename: false,
    }),
  });

  // GetUser does not exist in schema, which causes an error in ts-graphql-plugin.
  // We alias `gql` function here so ts-graphql-plugin won’t attempt to type check the query.
  const gql2 = gql;

  client.writeQuery({
    query: gql2`
      query GetUser {
        user
      }
    `,
    data: {
      user: userContext,
    },
  });

  const params = new URLSearchParams(query).toString();

  const Wrapper = (
    // <Provider config={rollbarConfig}>
    <ApolloProvider client={client}>
      <StaticRouter location={`${route}?${params}`} context={{}}>
        <CacheProvider>
          <App />
        </CacheProvider>
      </StaticRouter>
    </ApolloProvider>
    // </Provider>
  );

  const content = await renderToStringWithData(Wrapper);
  const { html, style } = extractEmotion(content);

  const initialState = client.extract();

  return template
    .replace('%STYLED_CSS%', style)
    .replace('%CONTENT%', html)
    .replace(
      '%INIT_SCRIPT%',
      /* html */ `
        <script id="__APOLLO_STATE__" type="application/json">${JSON.stringify(
          initialState,
        ).replace(/</g, '\\u003c')}</script>
        <script id="__WS_JWT__" type="application/json">${JSON.stringify({
          authentication: wsJwt,
        }).replace(/</g, '\\u003c')}</script>
      `,
    );
};
