import { Prisma } from '.prisma/client';
import { Service } from 'typedi';

@Service()
class UserRepository {
  constructor(
    private dbContext: Prisma.UserDelegate<
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >,
  ) {}

  async create(username: string, password: string) {
    await this.dbContext.create({
      data: {
        username,
        password,
      },
    });
  }

  async find(id: number) {
    return await this.dbContext.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        username: true,
        role: true,
        scores: true
      }
    })
  }
}

export default UserRepository;
