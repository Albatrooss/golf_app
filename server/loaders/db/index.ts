import { PrismaClient } from '.prisma/client';
import env from '@/server/config/env';
import e from 'express';
import type { Container } from 'typedi';

const prisma = new PrismaClient();
const main = async (container: Container) => {
  const connection = () => prisma
}

export default main;
