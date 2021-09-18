import { Arg, Resolver, Query } from 'type-graphql';
import { User } from '../models';

@Resolver(of => User)
export class UserQueryResolver {
  @Query(returns => User)
  user(@Arg('id') id: string): User {
    return {
      id: '123',
      username: 'tim',
    };
  }
}
