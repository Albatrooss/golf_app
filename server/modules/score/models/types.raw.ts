import { ObjectType } from "type-graphql";

type NineScore = [number, number, number, number, number, number, number, number, number]

@ObjectType()
class Score {
  id!: number;
  // course!: Course;
  front!: number[];
  back!: number[];
  date?: Date;
}
