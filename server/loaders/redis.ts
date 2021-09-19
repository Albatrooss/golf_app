// Loader to initialize redis cache
import Redis from 'ioredis';
import env from '../config/env';

const redisLoader = () => {
  const redisOption = {
    port: parseInt(env.REDIS.PORT, 10),
    host: env.REDIS.HOST,
    password: env.REDIS.PASSWORD,
    retryStrategy(times: number) {
      // Same retry strategy with APP
      if (times > 100) {
        // End reconnecting with built in error
        return undefined;
      }
      // reconnect after
      return Math.min(times * 100, 3000);
    },
  };
  const client = new Redis(redisOption);
  const pubClient = new Redis(redisOption);
  const subClient = new Redis(redisOption);
  return { client, pubClient, subClient };
};

export default redisLoader;
