import type { Container } from 'typedi';
import { Repositories } from './repository';
import { UserService } from '../modules/services';

type ServiceLoaderInjectable = {
  Container: typeof Container;
  repositories: Repositories;
};

const serviceLoader = ({
  Container,
  repositories: { UserRepository },
}: ServiceLoaderInjectable) => {
  /** Instantiate a class and register it to the `type-di` container */
  const create = <T, R extends unknown[]>(
    Class: new (...args: R) => T,
    args: R,
  ) => {
    const instance = new Class(...args);
    Container.set(Class, instance);
    return instance;
  };
  const UserServiceInstance = create(UserService, [UserRepository]);
  return {
    UserService: UserServiceInstance,
  };
};

export default serviceLoader;

export type Services = ReturnType<typeof serviceLoader>;
