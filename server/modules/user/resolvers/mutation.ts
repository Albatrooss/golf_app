import { Mutation, Resolver } from 'type-graphql';

@Resolver()
export class UserMutationResolver {
  @Mutation(() => Boolean)
  register() {
    return true;
  }
}
