import { formatScores } from '@/server/utils';
import { Service } from 'typedi';
import { User, Role } from '../models';
import { UserRepository } from '../repository';

@Service()
class UserService {
  constructor(private UserRepository: UserRepository) {}

  async create(username: string, password: string) {
    return await this.UserRepository.create(username, password);
  }

  async find(id: number): Promise<User | null> {
    const rawUser = await this.UserRepository.find(id);
    console.log('rawUser', rawUser);
    if (!rawUser) return null;
    const h = {
      id: rawUser.id,
      username: rawUser.username,
      role: rawUser.role,
      scores: rawUser.scores.map(formatScores),
    };
    console.log('!!', h);
    return h;
  }
}

export default UserService;
