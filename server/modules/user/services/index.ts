import { Service } from 'typedi';
import { UserRepository } from '../repository';

@Service()
class UserService {
  constructor(private UserRepository: UserRepository) {}

  async create(username: string, password: string) {
    return await this.UserRepository.create(username, password);
  }
}

export default UserService
