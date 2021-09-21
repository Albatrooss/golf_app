import { Logger } from 'pino';
import { Container } from 'typedi';
import env from '../config/env';
import dbLoader from './db';
import prismaLoader from './prisma';
import fastifyLoader from './fastify/index';
import redisLoader from './redis';
import repositoryLoader from './repository';
import schemaLoader from './schema';
import serviceLoader from './service';
import { COMPARISON_BINARY_OPERATORS } from '@babel/types';

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
    const { client: redisClient, pubClient, subClient } = redisLoader();
    logger.info('Redis Client Loaded');
    // const [db, connection] = await dbLoader(Container);
    const connection = await dbLoader(Container);
    logger.info('Db Context Loaded');
    const prisma = prismaLoader();
    logger.info('Prisma Client Loaded');
    const repositories = repositoryLoader({
      Container,
      prisma,
    });
    logger.info(`Repositories Loaded`);
    const services = serviceLoader({
      Container,
      repositories,
    });
    logger.info(`Services Loaded`);
    const graphQlSchema = await schemaLoader();
    logger.info('GraphQL Schema Loaded');
    // crossModuleApiLoader({ schema: graphQlSchema, services });
    // logger.info('CrossModuleAPI Loaded');
    const app = await fastifyLoader({
      logger,
      graphQlSchema,
      services,
      redisClient,
      getUserById: async id => {
        return await prisma.user.findFirst({ where: { id } });
      },
    });
    logger.info('Fastify App Loaded');
    return app;
  } catch (err) {
    logger.error(err as any, 'Main Loader Failed');
    process.exit(1);
  }
};
