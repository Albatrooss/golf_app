import { Prisma } from '.prisma/client';
import { Service } from 'typedi';

@Service()
class ScoreRepository {
  constructor(
    private dbContext: Prisma.ScoreDelegate<
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >,
  ) {}

  async create(userId: number,) {
    await this.dbContext.create({
      data: {
        userId
      },
    });
  }
}

export default ScoreRepository;
