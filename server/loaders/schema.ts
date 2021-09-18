import chalk from 'chalk';
import { resolve } from 'path';
import { Container, Service } from 'typedi';
import { __decorate } from 'tslib';
import { buildSchema, NonEmptyArray, PubSubEngine } from 'type-graphql';
import env from '../config/env';
import { UserQueryResolver } from '../modules/user/resolvers/query';
import { UserMutationResolver } from '../modules/user/resolvers/mutation';

export default async () => {
  const schema = await buildSchema({
    resolvers: getResolvers([UserQueryResolver, UserMutationResolver]),
    dateScalarMode: 'isoDate',
    emitSchemaFile: env.NODE_ENV === 'development' && {
      path: resolve(__dirname, '../schema.gql'),
    },
    container: Container,
  });
  return schema;
};

/**
 * Ensures no two resolvers have any method of the same name.
 */
const getResolvers = (
  resolvers: NonEmptyArray<new (...args: any[]) => any>,
) => {
  const names = new Map<string, string>();
  resolvers.forEach(resolver => {
    Object.getOwnPropertyNames(resolver.prototype).forEach(name => {
      if (name === 'constructor') return;
      if (names.has(name)) {
        console.warn(
          chalk`{yellow WARNING:} {blue ${names.get(name)}} and {blue ${
            resolver.name
          }} both have a method named {green ${name}}. This might introduce subtle bugs.`,
        );
        return;
      }
      names.set(name, resolver.name);
    });
  });
  return resolvers.map(Class =>
    __decorate([Service()], Class),
  ) as typeof resolvers;
};
