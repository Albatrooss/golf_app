import { Prisma } from '.prisma/client';
import { Service } from 'typedi';

@Service()
class ScoreRepository {
  constructor(
    private dbContext: Prisma.ScoreDelegate<
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >,
  ) {}

  // async create(userId: number) {
  //   await this.dbContext.create({
  //     data: {
  //       userId
  //     },
  //   });
  // }

  async getHandicap(userId: number) {
    const select: Record<string, boolean> = {};
    for (let i = 1; i <= 18; i++) {
      select[`scr${i}`] = true;
    }
    return await this.dbContext.findMany({
      select: {
        ...select,
        course: true,
      },
      where: {
        userId,
      },
      orderBy: [{ date: 'desc' }],
      take: 10,
    });
  }
}

export default ScoreRepository;
