// This file is automatically generated.
/* eslint-disable */
import * as TypeGraphQL from 'type-graphql';
export type FixDecorator<T> = T;

import { ObjectType } from 'type-graphql';
type NineScore = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

@ObjectType()
class Score {
  @TypeGraphQL.Field(type => Number)
  id!: number; // course!: Course;

  @TypeGraphQL.Field(type => [Number], {
    description: 'course!: Course;',
  })
  front!: number[];

  @TypeGraphQL.Field(type => [Number])
  back!: number[];

  @TypeGraphQL.Field(type => Date, { nullable: true })
  date?: Date;
}

export { Score };
