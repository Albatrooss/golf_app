import { Logger } from 'pino';
import { Container } from 'typedi';
import env from '../config/env';
import dbLoader from './db';
// import fastifyLoader from './fastify/index';
// import redisLoader from './redis';
import repositoryLoader from './repository';
import schemaLoader from './schema';
// import serviceLoader from './service';

const GET_USER_PROJECTION = [
  'id',
  'org',
  'firstName',
  'lastName',
  'avatarFilestackId',
  'role',
  'location',
  'locations',
  'team',
  'email',
].join(' ');

type MainLoaderOption = {
  logger: Logger;
};

export default async ({ logger }: MainLoaderOption) => {
  try {
    // const { client: redisClient, pubClient, subClient } = redisLoader();
    // logger.info('Redis Client Loaded');
    // const [db, connection] = await dbLoader(Container);
    const connection = await dbLoader(Container);
    logger.info('Db Context Loaded');

    // const repositories = repositoryLoader({
    //   Container,
    //   db,
    //   connection,
    // });
    // logger.info(`Repositories Loaded`);
    // const services = serviceLoader({
    //   Container,
    //   repositories,
    // });
    // logger.info(`Services Loaded`);
    const graphQlSchema = await schemaLoader();
    logger.info('GraphQL Schema Loaded');
    // crossModuleApiLoader({ schema: graphQlSchema, services });
    // logger.info('CrossModuleAPI Loaded');
    const app = await fastifyLoader({
      logger,
      graphQlSchema,
      services,
      // redisClient,
      // getUserById: async userId => {
      //   // @TODO: Replace with cross service API
      //   // @ts-ignore: _id exists on response
      //   const { _id, ...user } = await db.User.findById(userId)
      //     .select(GET_USER_PROJECTION)
      //     .lean({
      //       virtuals: true,
      //       getters: true,
      //     });
      //   return user;
      // },
    });
    logger.info('Fastify App Loaded');
    return app;
  } catch (err) {
    logger.error(err, 'Main Loader Failed');
    process.exit(1);
  }
};
