// Single source of truth for Prisma client
// This prevents multiple instances in Next.js development

import { Prisma, PrismaClient } from '@prisma/client';

const prismaClientSingleton = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  var cachedPrisma: PrismaClientSingleton | undefined;
}

export const prisma = global.cachedPrisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.cachedPrisma = prisma;
}

// Optional: Add logging for development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: Prisma.QueryEvent) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + JSON.stringify(e.params));
    console.log('Duration: ' + e.duration + 'ms');
  });
}

export default prisma;
