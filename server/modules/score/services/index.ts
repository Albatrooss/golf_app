import { Service } from "typedi";

@Service()
class ScoreService {
  constructor(private scoreRepository: ScoreRepository) {}
}
