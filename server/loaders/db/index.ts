import env from '@/server/config/env';
import type { Container } from 'typedi';
import { createConnection } from 'typeorm';
import { User } from './entities/User';

const main = async (container: Container) => {
  const connection = await createConnection({
    type: 'postgres',
    host: env.POSTGRES.HOST,
    database: env.POSTGRES.DB,
    username: env.POSTGRES.USERNAME,
    password: env.POSTGRES.PWD,
    logging: true,
    synchronize: true,
    entities: [User]
  })
  return connection;
}

export default main;
