import { Arg, Resolver, Query, Int } from 'type-graphql';
import { Inject } from 'typedi';
import { User } from '../models';
import UserService from '../services';

@Resolver(of => User)
export class UserQueryResolver {
  @Inject() userService!: UserService;

  @Query(returns => User, { nullable: true })
  async user(@Arg('id', () => Int) id: number): Promise<User | null> {
    return await this.userService.find(id)
  }
}
