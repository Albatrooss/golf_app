import env from './config/env';
import mainLoader from './loaders';
import logger from './config/logger';

const startTime = Date.now();

export async function main() {
  const app = await mainLoader({ logger });
  const serverUrl = await app.listen(env.PORT, '0.0.0.0');
  
}
