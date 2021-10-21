import { formatScores } from '../../../utils';
// import { formatScores } from '@/server/utils';
import { Service } from 'typedi';
import { User, Role } from '../models';
import { UserRepository } from '../repository';

@Service()
class UserService {
  constructor(private UserRepository: UserRepository) {}

  async create(username: string, password: string) {
    return await this.UserRepository.create(username, password);
  }

  async findbyId(id: number): Promise<User | null> {
    const rawUser = await this.UserRepository.findById(id);
    if (!rawUser) return null;
    const h = {
      id: rawUser.id,
      username: rawUser.username,
      role: rawUser.role,
      scores: rawUser.scores.map(formatScores),
    };
    return h;
  }
}

export default UserService;
