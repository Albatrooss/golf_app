import { Service } from 'typedi';
import ScoreRepository from '../repositories/scoreRepository';

@Service()
class ScoreService {
  constructor(private scoreRepository: ScoreRepository) {}

  async getHandicap(userId: number) {
    return this.scoreRepository.getHandicap(userId);
  }
}

export default ScoreService;
