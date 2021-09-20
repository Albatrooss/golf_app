/* eslint-disable no-process-env */
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ServerError,
  split,
  from,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { onError } from '@apollo/client/link/error';
import { BrowserRouter } from 'react-router-dom';
import { getMainDefinition } from '@apollo/client/utilities';
import { render, hydrate, Renderer } from 'react-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { message } from 'antd';
import { createUploadLink } from 'apollo-upload-client';
// import Rollbar from 'rollbar';
// import { Provider } from '@rollbar/react';
import typePolicies from './typePolicies';
import App from './App';

import 'antd/dist/antd.min.css';
// import 'react-datasheet/lib/react-datasheet.css';
import './style.css';

let renderer: Renderer;
let cache: InMemoryCache;
let url: URL;
let wsJwtPayload: { authentication?: string } = {};

// const rollbarClient = new Rollbar({
//   accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
//   environment: process.env.ROLLBAR_ENV,
//   addErrorContext: true,
//   captureIp: 'anonymize',
//   captureUncaught: true,
//   captureUnhandledRejections: true,
//   payload: {
//     client: {
//       javascript: {
//         code_version: process.env.APP_VERSION,
//       },
//     },
//   },
// });

if (process.env.USING_WEBPACK_SERVER) {
  renderer = render;
  url = new URL('http://localhost:3000');
  cache = new InMemoryCache({ typePolicies, addTypename: false });
} else {
  renderer = hydrate;
  url = new URL(window.location.origin);
  cache = new InMemoryCache({ typePolicies, addTypename: false }).restore(
    JSON.parse(document.getElementById('__APOLLO_STATE__')!.innerHTML),
  );
  wsJwtPayload = JSON.parse(document.getElementById('__WS_JWT__')!.innerHTML);
}

const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

const errorHandler = onError(({ networkError, graphQLErrors }) => {
  const serverError = networkError as ServerError;

  if (serverError?.statusCode === 401) {
    window.location.assign(`${url.protocol}//${url.host}/login`);
  }

  const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

  // if (serverError?.statusCode === 500) {
  //   rollbarClient.error('Server Status 500', serverError);
  //   message.error(GENERIC_ERROR_MESSAGE);
  // }

  if (graphQLErrors) {
    const firstGQLErrorCode = graphQLErrors[0]?.extensions?.code;

    if (firstGQLErrorCode === 500) message.error(GENERIC_ERROR_MESSAGE);

    graphQLErrors.forEach(error => {
      console.error(error);
      // rollbarClient.error('GraphQL Error', error);
    });
  }
});

// NOTE: To prevent multiple requests going out at the same time
// with expiring tokens
const batchHttpLink = new BatchHttpLink({
  uri: `${url.protocol}//${url.host}/graphql`,
  credentials: 'include',
  batchInterval: 20,
});

const uploadLink = createUploadLink({
  uri: `${url.protocol}//${url.host}/graphql`,
  credentials: 'include',
});

const wsLink = new WebSocketLink({
  uri: `${wsProtocol}//${url.host}/graphql`,
  options: {
    reconnect: true,
    connectionParams: wsJwtPayload,
  },
});

const subscriptionSplitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation'
    );
  },
  // @ts-ignore: type contracts aren’t nominally equivalent
  // between the official Apollo Client and the object created by createUploadLink
  uploadLink,
  batchHttpLink,
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  subscriptionSplitLink,
);

const client = new ApolloClient({
  link: from([errorHandler, splitLink]),
  credentials: 'include',
  cache,
});

const styleCache = createCache({ key: 'golf' });

renderer(
  // <Provider instance={rollbarClient}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <CacheProvider value={styleCache}>
          <App />
        </CacheProvider>
      </BrowserRouter>
    </ApolloProvider>,
  // </Provider>,
  document.querySelector('[data-app]'),
);
