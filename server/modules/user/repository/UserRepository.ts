import { Prisma } from '.prisma/client';
import { User } from '@/server/loaders/db/entities/User';
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
}

export default UserRepository;
