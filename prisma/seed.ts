import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Seeding Database...')
    prisma.user.create({
      data: {
        username: 'albatrooss',
        password: 'password'
      }
    })
  } catch(e) {
    console.error(e);
  } finally {
    console.log('Done Seeding Database...')
  }
}

export default seed;
