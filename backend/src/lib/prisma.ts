import { PrismaClient } from "@prisma/client";


// Create a single Prisma client instance
// Only log errors and warnings in production; enable query logging only in development if needed
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

// Default export for compatibility
export default prisma;
