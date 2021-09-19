/* eslint-disable max-classes-per-file */

export enum StatusCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}
export class ApiError extends Error {
  name = 'ApiError';
  type = 'API_ERROR';
  code = '';
  statusCode = StatusCode.InternalServerError;

  constructor(message = '', public context?: Record<string, any>) {
    super(message);
  }
}

export class BadRequestError extends ApiError {
  name = 'BadRequestError';
  type = 'BAD_REQUEST';
  statusCode = StatusCode.BadRequest;
}

export class UnauthorizedError extends ApiError {
  name = 'UnauthorizedError';
  type = 'UNAUTHORIZED';
  statusCode = StatusCode.Unauthorized;
}

export class CrossServiceError extends ApiError {
  name = 'CrossServiceError';
  type = 'UNAUTHORIZED_CROSS_SERVICE';
  statusCode = StatusCode.Unauthorized;
}

export class ForbiddenError extends ApiError {
  name = 'ForbiddenError';
  type = 'FORBIDDEN_ACTION';
  statusCode = StatusCode.Forbidden;
}

export class NotFoundError extends ApiError {
  name = 'NotFoundError';
  type = 'RESOURCE_NOT_FOUND';
  statusCode = StatusCode.NotFound;
}

export default {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  CrossServiceError,
  ForbiddenError,
  NotFoundError,
};
