import fp from 'fastify-plugin';
import { Logger } from 'pino';
import { FastifyPluginCallback } from 'fastify';
import OAuth2, { OAuthPluginOptions } from './OAuth2';
// import crossServiceAuth, {
//   CrossServiceAuthPluginOptions,
// } from './crossServiceAuth';
// import brokerBayOAuth2, { BbOAuthPluginOptions } from './brokerbayOAuth2';

type AuthenticationPluginOptions = {
  logger: Logger;
  securePaths: string[];
  OAuthPluginOption: OAuthPluginOptions;
  // crossServiceAuthPluginOption: CrossServiceAuthPluginOptions;
};
const authentication: FastifyPluginCallback<AuthenticationPluginOptions> =
  async (fastify, options) => {
    // Paths that require authentication
    const {
      logger,
      securePaths,
      OAuthPluginOption,
      // crossServiceAuthPluginOption,
    } = options;
    /* 
      Decorating core objects with this API allows the underlying JavaScript engine
      to optimize handling of the server, request, and reply objects.
    */
    fastify.decorateRequest('user', null);
    fastify.decorateRequest('tokens', null);
    // fastify.decorateRequest('isCrossRequest', null);

    // Register OAuth2
    fastify.register(OAuth2, OAuthPluginOption);

    // Register Cross Service Auth
    // fastify.register(crossServiceAuth, crossServiceAuthPluginOption);

    fastify.addHook('preValidation', async (req, reply) => {
      if (securePaths.includes(req.routerPath)) {
        logger.debug(
          { path: req.routerPath, method: req.routerMethod },
          `Adding Auth Hook`,
        );
        await fastify.authenticate(req, reply);
      }
    });
  };

export default fp(authentication);
