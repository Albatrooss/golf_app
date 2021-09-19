import { Container } from 'typedi';
import { PrismaClient } from '.prisma/client';
import { UserRepository } from '../modules/user/repository';

type RepositoryLoaderArg = {
  Container: typeof Container;
  prisma: PrismaClient
};

const repositoryLoader = ({ prisma  }: RepositoryLoaderArg) => {
  /** Instantiate a class and register it to the `type-di` container */
  const create = <T, R extends unknown[]>(
    Class: new (...args: R) => T,
    args: R,
  ) => {
    const instance = new Class(...args);
    Container.set(Class, instance);
    return instance;
  };
  return {
    UserRepository: create(UserRepository, [
      prisma.user
    ])
  };
};

export default repositoryLoader;

export type Repositories = ReturnType<typeof repositoryLoader>;
