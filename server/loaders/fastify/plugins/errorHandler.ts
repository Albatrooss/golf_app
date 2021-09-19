import type {
  FastifyPluginCallback,
  FastifyRequest,
  FastifyReply,
  FastifyError,
} from 'fastify';
import fp from 'fastify-plugin';

import { ApiError, StatusCode } from '../../../errors';

export interface errorHandlerPluginOptions {
  redirectPath?: {
    unauthorized?: string;
  };
}

declare module 'fastify' {
  interface FastifyInstance {
    // errorReporter: ErrorReporting;
  }
}

export const generateHandler =
  (
    // errorReporter: ErrorReporting,
    redirectConfig?: errorHandlerPluginOptions['redirectPath'],
  ) =>
  (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.debug(error, `errorHandler`);
    if (
      error.statusCode === StatusCode.Unauthorized &&
      redirectConfig?.unauthorized
    ) {
      return reply.redirect(redirectConfig?.unauthorized);
    }

    if (error instanceof ApiError) {
      return reply.code(error.statusCode).send({
        requestId: request.id,
        status: error.statusCode,
        type: error.type,
      });
    }
    // Report Error and Respond with status 500 if not handled
    request.log.error(error);
    // errorReporter.report(error, request);
    return reply.code(error.statusCode || StatusCode.InternalServerError).send({
      status: error.statusCode || StatusCode.InternalServerError,
      requestId: request.id,
    });
  };

const errorHandlerPlugin: FastifyPluginCallback<errorHandlerPluginOptions> =
  async (fastify, options) => {
    const { redirectPath } = options;

    // fastify.decorate(
    //   'errorReporter',
    //   new ErrorReporting(gcpErrorReportingOptions),
    // );
    // fastify.setErrorHandler();
  };

export default fp(errorHandlerPlugin);
