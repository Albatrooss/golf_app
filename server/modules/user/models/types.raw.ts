import { ObjectType } from 'type-graphql';
import { Score } from '../../score/models';

@ObjectType()
class User {
  id!: number;
  username!: string;
  role!: Role;
  scores!: Score[];
}

enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
