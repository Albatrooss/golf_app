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
  }

  REDIS = {
    PORT: this.getOptional('REDIS_PORT', '6379'),
    HOST: this.getOptional('REDIS_HOST', 'localhost'),
    PASSWORD: this.getOptional('REDIS_PASS', ''),
  };

  CORS_ORIGIN = this.get('CORS_ORIGIN');
}

export default new EnvironmentVariables();
