import { Score } from '../modules/score/models';
import { Score as PrismaScore } from '../../prisma/generated/type-graphql/models/Score';

export const formatScores = (score: PrismaScore): Score => {
  let front: number[] = [];
  let back: number[] = [];
  if (
    score.scr1 &&
    score.scr2 &&
    score.scr3 &&
    score.scr4 &&
    score.scr5 &&
    score.scr6 &&
    score.scr7 &&
    score.scr8 &&
    score.scr9
  ) {
    front = [
      score.scr1,
      score.scr2,
      score.scr3,
      score.scr4,
      score.scr5,
      score.scr6,
      score.scr7,
      score.scr8,
      score.scr9,
    ];
  }
  if (
    score.scr10 &&
    score.scr11 &&
    score.scr12 &&
    score.scr13 &&
    score.scr14 &&
    score.scr15 &&
    score.scr16 &&
    score.scr17 &&
    score.scr18
  ) {
    back = [
      score.scr10,
      score.scr11,
      score.scr12,
      score.scr13,
      score.scr14,
      score.scr15,
      score.scr16,
      score.scr17,
      score.scr18,
    ];
  }
  return {
    id: score.id,
    date: score?.date ? score.date : undefined,
    front,
    back,
  };
};
