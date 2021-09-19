/* 
TODO: When this fastify plugin is re-used in another repo for
CrossServiceAuth purpose, move this into @brokerbay/utils or
equivalent for modularity.
*/
/* eslint-disable camelcase */
import axios from 'axios';
import fp from 'fastify-plugin';
import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import ipaddr from 'ipaddr.js';
import {
  ForbiddenError,
  UnauthorizedError,
  CrossServiceError,
  NotFoundError,
} from '../../../../errors';

export interface OAuthUser {
  id: string;
  username: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticateCrossService: (req: FastifyRequest) => Promise<boolean | void>;
  }
  interface FastifyRequest {
    user?: OAuthUser;
    tokens?: {
      refreshToken: string;
      accessToken: string;
    };
    isCrossRequest?: boolean;
  }
}

export type CrossServiceAuthPluginOptions = {
  auth: {
    tokenHost: string;
    tokenPath: string;
  };
  redisClient: Redis;
  tokenCacheDuration: number;
  ipRange: string;
  deserializeUser: (userId: string) => Promise<OAuthUser>;
};

const crossServiceAuthPlugin: FastifyPluginCallback<CrossServiceAuthPluginOptions> =
  async (fastify, options) => {
    const {
      auth,
      redisClient,
      tokenCacheDuration,
      ipRange,
      deserializeUser,
    } = options;

    const fetchUser = async (req: FastifyRequest, userId: string) => {
      const user = await deserializeUser(userId);
      if (!user) {
        throw new ForbiddenError(
          'Forbidden: user not found with Cross Service token',
        );
      }

      req.user = user;
      return true;
    };

    const verifyToken = async (req: FastifyRequest, token: string) => {
      // Same as the monolith APP, Cross Service tokens are stored in Redis
      // with a prefix 'cs'
      const redisPrefix = 'cs';
      const { tokenHost, tokenPath } = auth;
      try {
        const cachedUserId = await redisClient.get(`${redisPrefix}:${token}`);

        if (cachedUserId) {
          return fetchUser(req, cachedUserId);
        }

        const tokenCheckUrl = new URL(tokenPath, tokenHost);
        const tokenCheckParams = new URLSearchParams({
          token,
        });

        const { data: result } = await axios.post(
          tokenCheckUrl.toString(),
          tokenCheckParams,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        if (!result.user_id) {
          throw new NotFoundError(
            `Check Token Response with no user_id ${JSON.stringify(result)}`,
          );
        }
        const currentUnix = Math.floor(Date.now() / 1000);
        if (result.exp > currentUnix) {
          if (result.exp > currentUnix + tokenCacheDuration) {
            await redisClient.set(`${redisPrefix}:${token}`, result.user_id);
            redisClient.expire(`${redisPrefix}:${token}`, tokenCacheDuration);
          }

          return fetchUser(req, result.user_id);
        }
        return false;
      } catch (err) {
        if (err instanceof ForbiddenError) throw err;
        throw new CrossServiceError(
          `Invalid Bearer Token, ${err.message}`,
        );
      }
    };

    const isLocal = (ip: string) => {
      const localIP = ipaddr.parseCIDR(ipRange);
      const parsed = ipaddr.process(ip);
      const res = parsed.kind() === 'ipv4' && parsed.match(localIP);
      return res;
    };

    fastify.decorate(
      'authenticateCrossService',
      async (req: FastifyRequest) => {
        req.log.debug('Authenticating Cross Service');
        const tokenMatch = 'Bearer';
        const bearerToken = req.headers.authorization;
        const parsedToken =
          bearerToken?.match(tokenMatch) &&
          bearerToken.split(tokenMatch)[1].trim();

        if (!parsedToken) {
          // If without bearer token, check IP
          // we are back from the redirect. Check the IP address
          if (!req.ip || !isLocal(req.ip)) {
            throw new UnauthorizedError(
              `Unauthorized IP Address: ${req.ip}`,
            );
          }
          // const accountType = req.headers[
          //   'bb-cross-service'
          // ] as ServiceAccounts;
          // if (!serviceAccountMap[accountType]) {
          //   throw new UnauthorizedError(
          //     `Invalid service account type ${accountType}`,
          //   );
          // }
          // req.user = serviceAccountMap[accountType];
        } else {
          await verifyToken(req, parsedToken);
          req.tokens = {
            accessToken: parsedToken,
            refreshToken: '',
          };
        }
      },
    );
  };
export default fp(crossServiceAuthPlugin);
