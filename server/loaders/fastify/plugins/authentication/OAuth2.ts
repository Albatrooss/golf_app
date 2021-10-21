/* eslint-disable camelcase */
import { once, EventEmitter } from 'events';
import axios from 'axios';
import fp from 'fastify-plugin';
import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import { CookieSerializeOptions } from 'fastify-cookie';
import { TokenExpiredError, decode } from 'jsonwebtoken';
import { ForbiddenError, UnauthorizedError } from '../../../../errors';
import { OAuthUser } from './crossServiceAuth';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      req: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<boolean | void>;
    tokenRefreshQueue: ConcurrentTokenRefreshQueue;
  }
  interface FastifyRequest {
    user?: OAuthUser;
    tokens?: {
      refreshToken: string;
      accessToken: string;
    };
  }
}

export type RefreshResult = {
  refreshToken: string;
  accessToken: string;
  expiresIn: number;
  user: OAuthUser;
};

export type OAuthCallbackQuery = {
  code: string;
};

export type LogoutRedirectQuery = {
  next?: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: 'bearer';
  refresh_token: string;
  expires_in: number;
  scope: string;
  user_id: string;
};

export type OAuthJwtCookie = {
  refreshToken: string;
  accessToken: string;
  user: OAuthUser;
  iat: number;
  exp: number;
};

export type OAuthPluginOptions = {
  client: {
    id: string;
    secret: string;
  };
  auth: {
    authorizeHost: string;
    authorizePath: string;
    tokenHost: string;
    tokenPath: string;
    successHost: string;
    successPath: string;
  };
  cookie: {
    name: string;
    options: CookieSerializeOptions;
  };
  authInitiateEntryRoute: string;
  authSuccessRedirectRoute: string;
  authLogoutRoute: string;
  deserializeUser: (userId: string) => Promise<OAuthUser>;
  isAuthorized: (user: OAuthUser) => Promise<boolean>;
};

class ConcurrentTokenRefreshQueue {
  #emitterMap: Map<string, EventEmitter>;

  constructor() {
    this.#emitterMap = new Map();
  }

  isRefreshing(refreshToken: string) {
    return this.#emitterMap.has(refreshToken);
  }

  startRefreshing(refreshToken: string) {
    return this.#emitterMap.set(refreshToken, new EventEmitter());
  }

  doneRefreshing(refreshToken: string, response: RefreshResult) {
    this.#emitterMap.get(refreshToken)?.emit('done', response);
    return this.#emitterMap.delete(refreshToken);
  }

  async waitForRefresh(refreshToken: string) {
    if (!this.#emitterMap.get(refreshToken)) {
      throw new Error('Auth Refresh Event Emitter not Found');
    }
    const [refreshResult] = await once(
      this.#emitterMap.get(refreshToken)!,
      'done',
    );
    return refreshResult as RefreshResult;
  }
}

const bbOAuthPlugin: FastifyPluginCallback<OAuthPluginOptions> = async (
  fastify,
  options,
) => {
  // Token Refresh Queue to prevent Concurrent token refresh causing
  // mismatch between JWT and valid Bearer Token
  // NOTE: Not horizontal scalable
  fastify.decorate('tokenRefreshQueue', new ConcurrentTokenRefreshQueue());

  const {
    authInitiateEntryRoute,
    client,
    auth,
    cookie,
    deserializeUser,
    isAuthorized,
    authSuccessRedirectRoute,
    authLogoutRoute,
  } = options;

  const refreshAuth = async (
    req: FastifyRequest,
    reply: FastifyReply,
    authCookie: string,
  ) => {
    const { tokenRefreshQueue } = fastify;
    const { tokenHost, tokenPath } = auth;
    const decoded = decode(authCookie);
    if (typeof decoded === 'string' || !decoded?.refreshToken) {
      reply.clearCookie(cookie.name, cookie.options);
      throw new UnauthorizedError('Invalid JWT');
    }
    if (tokenRefreshQueue.isRefreshing(decoded.refreshToken)) {
      req.log.debug('Waiting for refresh');
      const { refreshToken, accessToken, user } =
        await tokenRefreshQueue.waitForRefresh(decoded.refreshToken);
      req.user = user;
      req.tokens = {
        refreshToken,
        accessToken,
      };
      return true;
    }
    tokenRefreshQueue.startRefreshing(decoded.refreshToken);
    const tokenUrl = new URL(tokenPath, tokenHost);
    const tokenParams = new URLSearchParams({
      client_id: client.id,
      client_secret: client.secret,
      grant_type: 'refresh_token',
      refresh_token: decoded.refreshToken,
    });
    tokenUrl.search = tokenParams.toString();
    try {
      req.log.debug(`Refreshing Token: ${tokenUrl}`);
      const { data } = await axios.post<TokenResponse>(tokenUrl.toString());
      const {
        refresh_token: refreshToken,
        access_token: accessToken,
        expires_in: expiresIn,
        user_id: userId,
      } = data;

      const user = await deserializeUser(userId);
      // Authorization / Check if is BrokerBay Org User
      const isUserAuthorized = await isAuthorized(user);
      if (!isUserAuthorized) {
        throw new ForbiddenError('Forbidden');
      }
      const cookieData = {
        refreshToken,
        accessToken,
        expiresIn,
        user,
      };
      tokenRefreshQueue.doneRefreshing(decoded.refreshToken, cookieData);
      // @ts-ignore: cookieData can be object due to custom sign function
      reply.setCookie(cookie.name, cookieData, cookie.options);
      const setCookieHeader = reply.getHeader('Set-Cookie');
      const updatedCookie = setCookieHeader?.split(';')[0];
      req.headers.cookie = updatedCookie;
      req.log.debug({ data }, `Refreshed Token`);
      req.user = user;
      req.tokens = {
        refreshToken,
        accessToken,
      };
      return true;
    } catch (refreshError) {
      if (refreshError instanceof ForbiddenError) {
        throw refreshError;
      }
      req.log.debug('Error Refreshing Token', refreshError);
      reply.clearCookie(cookie.name, cookie.options);
      throw new UnauthorizedError('Invalid Refresh Token');
    }
  };

  const verifyCookie = async (
    req: FastifyRequest,
    reply: FastifyReply,
    authCookie: string,
  ) => {
    try {
      const verified = req.unsignCookie(
        authCookie,
      ) as unknown as OAuthJwtCookie;
      req.log.debug({ verified }, 'Verified JWT Cookie');
      const isUserAuthorized = await isAuthorized(verified.user);
      if (!isUserAuthorized) {
        throw new ForbiddenError('Forbidden');
      }
      req.user = verified.user;
      req.user = {
        id: 8,
        username: 'albatrooss',
      };
      req.tokens = {
        refreshToken: verified.refreshToken,
        accessToken: verified.accessToken,
      };
      // req.tokens = {
      //   accessToken: '123',
      //   refreshToken: '456'
      // }
      return true;
    } catch (err) {
      // throw new UnauthorizedError('Invalid JWT');
      if (err instanceof ForbiddenError) throw err;
      if (err instanceof TokenExpiredError) {
        await refreshAuth(req, reply, authCookie);
      } else {
        reply.clearCookie(cookie.name, cookie.options);
        throw new UnauthorizedError(`Invalid JWT ${err.message}`);
      }
    }
  };

  fastify.decorate(
    'authenticate',
    async (req: FastifyRequest, reply: FastifyReply) => {
      req.log.debug('Authenticating');
      // const authCookie = req.cookies[cookie.name];
      const authCookie =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWZyZXNoVG9rZW4iOiIxMjM0NTY3ODkwIiwiYWNjZXNzVG9rZW4iOiIxMjM0NTY3ODkwIiwiZXhwIjoxNzE2MjM5MDIyLCJpYXQiOjE1MTYyMzkwMjIsInVzZXIiOnsiaWQiOjgsInVzZXJuYW1lIjoiYWxiYXRyb29zcyJ9fQ.wmDTB5aWp-MaxYD80oChV5atSVQo5mM7ONeooshyTds';
      req.log.debug(`Cookie: ${authCookie}`);
      if (!authCookie) {
        throw new UnauthorizedError('Missing JWT Cookie');
      }
      await verifyCookie(req, reply, authCookie);
    },
  );

  fastify.get(authInitiateEntryRoute, async (req, res) => {
    const { authorizeHost, authorizePath, successHost, successPath } = auth;
    const redirectUrl = new URL(successPath, successHost);
    const redirectParams = new URLSearchParams({
      client: `${req.protocol}://${req.hostname}`,
    });
    redirectUrl.search = redirectParams.toString();
    const authUrl = new URL(authorizePath, authorizeHost);
    const authParams = new URLSearchParams({
      client_id: client.id,
      redirect_uri: redirectUrl.toString(),
      response_type: 'code',
    });
    authUrl.search = authParams.toString();
    return res.redirect(authUrl.toString());
  });

  fastify.get<{
    Querystring: LogoutRedirectQuery;
  }>(authLogoutRoute, async (req, reply) => {
    reply.clearCookie(cookie.name, cookie.options);
    const { next } = req.query;
    if (next) {
      return reply.redirect(next);
    }
    const [, , clientName] = client.id.split(':');
    const logoutUrl = new URL('/logout', auth.authorizeHost);
    const logoutParams = new URLSearchParams({
      client: clientName,
    });
    logoutUrl.search = logoutParams.toString();
    return reply.redirect(logoutUrl.toString());
  });

  fastify.get<{
    Querystring: OAuthCallbackQuery;
  }>('/oauth/callback', async (req, reply) => {
    req.log.debug('OAuth Callback', req.query.code);
    const { tokenHost, tokenPath, successHost, successPath } = auth;
    const redirectUrl = new URL(successPath, successHost);
    const redirectParams = new URLSearchParams({
      client: `${req.protocol}://${req.hostname}`,
    });
    redirectUrl.search = redirectParams.toString();
    const tokenUrl = new URL(tokenPath, tokenHost);
    const tokenParams = new URLSearchParams({
      client_id: client.id,
      client_secret: client.secret,
      redirect_uri: redirectUrl.toString(),
      grant_type: 'authorization_code',
      code: req.query.code,
    });
    tokenUrl.search = tokenParams.toString();
    try {
      const { data } = await axios.post<TokenResponse>(tokenUrl.toString());
      const {
        refresh_token: refreshToken,
        access_token: accessToken,
        user_id: userId,
        expires_in: expiresIn,
      } = data;
      const user = await deserializeUser(userId);
      // Authorization / Check if is BrokerBay Org User
      // const isUserAuthorized = await isAuthorized(user);
      // if (!isUserAuthorized) {
      //   throw new Error('Forbidden');
      // }
      // NOTE: We have use cookies to prepare for SSR
      const cookieData = {
        refreshToken,
        accessToken,
        expiresIn,
        user,
      };
      return (
        reply
          // @ts-ignore: cookieData can be object due to custom sign function
          .setCookie(cookie.name, cookieData, cookie.options)
          .redirect(authSuccessRedirectRoute)
      );
    } catch (err) {
      req.log.debug({ err }, `OAuth Callback Failed`);
      return reply.status(403).send('Forbidden');
    }
  });
};
export default fp(bbOAuthPlugin);
