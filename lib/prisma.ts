// lib/prisma.ts

import { PrismaClient } from './generated/prisma';

// Prevent multiple instances in dev caused by hot reloads:
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

// If in development mode, attach Prisma to globalThis:
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
