/* eslint-disable no-process-env */
import { EnvKey, EnvKeys } from './env.generated';

class EnvironmentVariables {
  constructor() {
    EnvKeys.forEach(key => {
      if (!process.env[key])
        throw new Error(`Missing Environment Variable: ${key}`);
    });
  }

  get(key: EnvKey) {
    return process.env[key]!;
  }

  getOptional(key: string, fallback: string) {
    return process.env[key] || fallback;
  }

  NODE_ENV: 'production' | 'development' | 'test' = this.get('NODE_ENV') as any;

  SECRET = {
    JWT: this.get('JWT_SECRET'),
  };

  PORT = this.getOptional('PORT', '3001');

  POSTGRES = {
    HOST: this.getOptional('POSTGRES_HOST', 'localhost'),
    USERNAME: this.get('POSTGRES_USERNAME'),
    PWD: this.get('POSTGRES_PASSWORD'),
    DB: this.get('POSTGRES_DB'),
  };

  REDIS = {
    PORT: this.getOptional('REDIS_PORT', '6379'),
    HOST: this.getOptional('REDIS_HOST', 'localhost'),
    PASSWORD: this.getOptional('REDIS_PASS', ''),
  };

  CORS_ORIGIN = this.get('CORS_ORIGIN');

  ROLLBAR = {
    ACCESS_TOKEN: this.get('ROLLBAR_TOKEN'),
    LOG_LEVEL: this.get('ROLLBAR_LOG_LEVEL'),
    ENV: this.get('ROLLBAR_ENV')
  };

  AUTH = {
    CLIENT_ID: this.get('AUTH_CLIENT_ID'),
    CLIENT_SECRET: this.get('AUTH_CLIENT_SECRET'),
    SERVER_URL: this.get('AUTH_SERVER_URL'),
  }
}

export default new EnvironmentVariables();
