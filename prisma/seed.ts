import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Seeding Database...');
    await prisma.score.deleteMany();
    await prisma.user.deleteMany();
    await prisma.course.deleteMany();
    const { id: userId } = await prisma.user.create({
      data: {
        username: 'albatrooss',
        password: 'password',
        role: 'ADMIN',
      },
    });
    const { id: courseId } = await prisma.course.create({
      data: {
        name: 'test course',
        par1: 3,
        hdc1: 1,
        par2: 3,
        hdc2: 2,
        par3: 3,
        hdc3: 3,
        par4: 3,
        hdc4: 4,
        par5: 3,
        hdc5: 5,
        par6: 3,
        hdc6: 6,
        par7: 3,
        hdc7: 7,
        par8: 3,
        hdc8: 8,
        par9: 3,
        hdc9: 9,
        par10: 3,
        hdc10: 10,
        par11: 3,
        hdc11: 11,
        par12: 3,
        hdc12: 12,
        par13: 3,
        hdc13: 13,
        par14: 3,
        hdc14: 14,
        par15: 3,
        hdc15: 15,
        par16: 3,
        hdc16: 16,
        par17: 3,
        hdc17: 17,
        par18: 3,
        hdc18: 18,
      },
    });
    await prisma.score.create({
      data: {
        date: new Date(),
        scr1: 3,
        scr2: 3,
        scr3: 3,
        scr4: 3,
        scr5: 3,
        scr6: 3,
        scr7: 3,
        scr8: 3,
        scr9: 3,
        scr10: 3,
        scr11: 3,
        scr12: 3,
        scr13: 3,
        scr14: 3,
        scr15: 3,
        scr16: 3,
        scr17: 3,
        scr18: 3,
        userId: userId,
        courseId: courseId,
      },
    });
  } catch (e) {
    console.error(e);
  } finally {
    console.log('Done Seeding Database...');
    prisma.$disconnect();
  }
}

seed();
