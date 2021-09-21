import { GraphQLSchema } from 'graphql';
import { Logger } from 'pino';
import { sign, verify } from 'jsonwebtoken';
import fastify from 'fastify';
import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import fastifyFavicon from 'fastify-favicon';
import fastifyStatic from 'fastify-static';
import fs from 'fs';
import mercurius from 'mercurius';
// import MercuriusGQLUpload from 'mercurius-upload';
import path from 'path';
import { Redis } from 'ioredis';
import fastifyExpress from 'fastify-express';
import type { ViteDevServer } from 'vite';
import { Services } from '../service';
import { ApiError, CrossServiceError } from '../../errors';
import errorHandler from './plugins/errorHandler';
import env from '../../config/env';
import authentication from './plugins/authentication';
import { LocalHostIpRanges, PrivateIpRanges } from './plugins/authentication/constants';
import { Prisma, User } from '.prisma/client';
// import loadDataLoader from '../dataLoaders';

const locate = (...paths: string[]) => path.resolve(__dirname, ...paths);

declare module 'fastify' {
  interface FastifyRequest {
    // span?: Span;
  }
}

type FastifyLoaderOptions = {
  graphQlSchema: GraphQLSchema;
  logger: Logger;
  services: Services;
  redisClient: Redis;
  getUserById: (id: number) => Promise<User | null>;
};

const fastifyLoader = async ({
  graphQlSchema,
  logger,
  services,
  redisClient,
  getUserById,
}: FastifyLoaderOptions) => {
  // Instantiate Fastify App
  const app = fastify({ logger });

  // Application Hooks
  app.addHook('onRoute', routeOptions => {
    routeOptions.prefixTrailingSlash = 'no-slash';
  });

  // Register Fastify Plugins
  // Register Error Handler
  app.register(errorHandler, {
    // gcpErrorReportingOptions: {
    //   serviceContext: {
    //     service: 'golf',
    //   },
    // },
    redirectPath: {
      unauthorized: '/login',
    },
  });

  // Register Cookie Plugin
  // @ts-ignore: types provided by plugin is incomplete
  app.register(fastifyCookie, {
    secret: {
      sign: (value: Record<string, any>) =>
        sign(value, env.SECRET.JWT, {
          // JWT to expire a minute before actual access token expires
          expiresIn: value.expiresIn - 60,
        }) as string,
      unsign: (value: string) =>
        verify(value, env.SECRET.JWT) as Record<string, any>,
    },
  });

  // Register Authentication
  app.register(authentication, {
    logger,
    securePaths: ['*', '/graphql'],
    OAuthPluginOption: {
      client: {
        id: env.AUTH.CLIENT_ID,
        secret: env.AUTH.CLIENT_SECRET,
      },
      auth: {
        tokenHost: env.AUTH.SERVER_URL,
        tokenPath: `/oauth/token`,
        authorizeHost: env.AUTH.SERVER_URL,
        authorizePath: `/oauth/authorize`,
        successHost: env.AUTH.SERVER_URL,
        successPath: `/oauth/success/golf`,
      },
      cookie: {
        name: 'golf',
        options: {
          // Allow Http during development
          secure: env.NODE_ENV !== 'development',
          // Disallow access to cookie through client JS
          httpOnly: true,
          // Sign Cookie using JWT spec
          signed: true,
          path: '/',
        },
      },
      authInitiateEntryRoute: '/login',
      authLogoutRoute: '/logout',
      authSuccessRedirectRoute: '/',
      deserializeUser: getUserById,
      isAuthorized: async user => user.id === '1',
    },
    crossServiceAuthPluginOption: {
      auth: {
        tokenHost: env.AUTH.SERVER_URL,
        tokenPath: '/oauth/check_token',
      },
      redisClient,
      tokenCacheDuration: parseInt(
        env.CROSS_SERVICE.TOKEN_DURATION || '10',
        10,
      ),
      ipRange: env.NODE_ENV === 'production'
        ? PrivateIpRanges
        : LocalHostIpRanges,
      // serviceAccountMap,
      deserializeUser: getUserById,
    },
  });

  // Register Mercurius File Upload
  // app.register(MercuriusGQLUpload);

  // Register Mercurius/GraphQL
  app.register(mercurius, {
    schema: graphQlSchema,
    context: (req, res) => ({
      req,
      res,
      services,
      // dataLoaders: loadDataLoader(services), // dataloader should be initialize on every request
    }),
    subscription: {
      onConnect: async ({ payload }) => {
        verify(payload.authentication, env.SECRET.JWT);
        return { isWebSocket: true };
      },
      context: (req, res) => ({
        req,
        res,
        services,
      }),
    },
    allowBatchedQueries: true,
    graphiql: env.NODE_ENV === 'development' ? 'graphiql' : undefined,

    errorFormatter(response) {
      const isCrossServiceError =
        response instanceof CrossServiceError;
      return {
        statusCode: isCrossServiceError ? 401 : 200,
        response: {
          ...response,
          errors: response?.errors?.map(err => ({
            ...err,
            extensions: {
              ...err.extensions,
              code: (err.originalError as ApiError)?.statusCode || 500,
              context: (err.originalError as ApiError)?.context,
            },
          })),
        },
      };
    },
  });

  app.register(fastifyFavicon, { path: './client', name: 'favicon.ico' });

  const rootPath =
    env.NODE_ENV === 'development' ? locate('../../..') : '../../..';

  const allowedOrigin: (string | RegExp)[] = [
    new RegExp(env.CORS_ORIGIN),
  ];
  if (env.NODE_ENV === 'development') {
    allowedOrigin.push(new RegExp('localhost'));
  }

  app.register(fastifyCors, {
    origin: allowedOrigin,
    credentials: true,
  });

  let vite: ViteDevServer | undefined;
  if (env.NODE_ENV === 'development') {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: 'ssr' },
    });
    await app.register(fastifyExpress);
    app.use(vite.middlewares);
  }

  if (!vite) {
    // Register Static Server
    app.register(fastifyStatic, {
      root: path.join(__dirname, `${rootPath}/client/assets`),
      prefix: '/assets/',
    });
  }

  app.get<{
    Params: Record<string, string>;
  }>('*', async (req, reply) => {
    const indexPath = locate(rootPath, 'client/index.html');

    const { ssr } = vite
      ? await vite!.ssrLoadModule(locate(rootPath, 'client/ssr.tsx'))
      : await import(locate(rootPath, 'client-server/index.js'));

    let indexTemplate = fs.readFileSync(indexPath, 'utf-8');
    if (vite) {
      indexTemplate = await vite.transformIndexHtml(req.url, indexTemplate);
    }

    const {
      headers: { host, cookie },
      params,
      routerPath,
      query,
      protocol,
      tokens,
    } = req;

    // Week long jwt for Websocket connection
    const wsJwt = sign({ token: tokens!.accessToken }, env.SECRET.JWT, {
      expiresIn: '7d',
    });

    const route = `${params[routerPath]}`;

    const baseUrl = `${protocol}://${host}`;
    const graphQLUrl = `${baseUrl}/graphql`;

    const result = await ssr({
      graphQLUrl,
      cookie: cookie!,
      route,
      query: query as Record<string, string>,
      template: indexTemplate,
      userContext: req.user,
      wsJwt,
      // rollbarConfig: {
      //   accessToken: env.ROLLBAR.ACCESS_TOKEN,
      //   environment: env.ROLLBAR.ENV,
      //   addErrorContext: true,
      //   captureIp: 'anonymize',
      //   captureUncaught: true,
      //   captureUnhandledRejections: true,
      //   payload: {
      //     context: 'ssr',
      //     person: {
      //       id: req.user?.id,
      //       username: req.user?.username,
      //     },
      //   },
      // },
    });
    reply.code(200).type('text/html').send(result);
  });

  // Decorators
  app.decorateRequest('span', null);

  // Hooks - In order of execution
  // https://www.fastify.io/docs/latest/Hooks/#requestreply-hooks
  // app.addHook('onRequest', (req, reply, done) => {
  //   req.log.debug({}, 'onRequest');
  //   done();
  // });

  // app.addHook('preParsing', (req, reply, payload, done) => {
  //   req.log.debug({}, 'preParsing');
  //   done();
  // });

  // app.addHook('preHandler', (req, reply, done) => {
  //   req.log.debug({ body: req.body }, 'preHandler');
  //   done();
  // });

  // app.addHook('preSerialization', (req, reply, payload, done) => {
  //   req.log.debug({}, 'preSerialization');
  //   done();
  // });

  // app.addHook('onError', (req, reply, error, done) => {
  //   req.log.debug({}, 'onError');
  //   done();
  // });

  // app.addHook('onSend', (req, reply, payload, done) => {
  //   req.log.debug({}, 'onSend');
  //   done();
  // });

  // app.addHook('onResponse', (req, reply, done) => {
  //   req.log.debug({}, 'onResponse');
  //   done();
  // });

  return app;
};

export default fastifyLoader;
