import { PrismaClient } from '@prisma/client';

const prismaLoader = () => {
  const prisma = new PrismaClient();
  return prisma;
};

export default prismaLoader;
