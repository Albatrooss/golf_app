import { Arg, Resolver, Query, Int, FieldResolver, Root } from 'type-graphql';
import { Inject } from 'typedi';
import { Score } from '../../score/models';
import { User } from '../models';
import UserService from '../services';
import ScoreService from '../../score/services';

@Resolver(of => User)
export class UserQueryResolver {
  @Inject() userService!: UserService;
  @Inject() scoreService!: ScoreService;

  @FieldResolver(returns => [Score])
  async handicap(@Root() { id }: User) {
    const scores = await this.scoreService.getHandicap(id);
    return 0;
  }

  @Query(returns => User)
  async me(@Arg('id', () => Int) id: number): Promise<User> {
    const user = await this.userService.findbyId(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  @Query(returns => User, { nullable: true })
  async getUserById(@Arg('id', () => Int) id: number): Promise<User | null> {
    return await this.userService.findbyId(id);
  }
}
