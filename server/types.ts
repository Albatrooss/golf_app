import { FastifyRequest, FastifyReply } from 'fastify';
// import { DataLoader } from './loaders/dataLoaders';
import { Services } from './loaders/service';

export type { Services };

export type RequestContext = {
  req: FastifyRequest;
  res: FastifyReply;
  services: Services;
  // dataLoaders: DataLoader;
};
