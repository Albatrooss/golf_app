import { ObjectType } from "type-graphql";

@ObjectType()
class User {
  id!: string;
  username!: string;
}
