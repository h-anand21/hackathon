import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
  prismaLocal: PrismaClient | undefined;
  prismaNeon: PrismaClient | undefined;
};

const localUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
const neonUrl = process.env.NEON_DATABASE_URL;

const prismaLocal =
  globalForPrisma.prismaLocal ??
  new PrismaClient({
    datasources: { db: { url: localUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

const prismaNeon =
  globalForPrisma.prismaNeon ??
  (neonUrl
    ? new PrismaClient({
        datasources: { db: { url: neonUrl } },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    : undefined);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaLocal = prismaLocal;
  globalForPrisma.prismaNeon = prismaNeon;
}

// Intercept write methods and replicate to both databases
const writeMethods = new Set([
  'create',
  'update',
  'delete',
  'upsert',
  'createMany',
  'updateMany',
  'deleteMany',
  'connect',
  'disconnect',
]);

const createProxy = () => {
  return new Proxy(prismaLocal, {
    get(target, prop, receiver) {
      // If it's a model property (e.g. user, task, etc.)
      if (typeof prop === 'string' && prop in target && !prop.startsWith('$')) {
        const localModel = (target as any)[prop];
        const neonModel = prismaNeon ? (prismaNeon as any)[prop] : null;

        return new Proxy(localModel, {
          get(modelTarget, method, modelReceiver) {
            const originalMethod = modelTarget[method];
            if (typeof originalMethod === 'function') {
              return async function (...args: any[]) {
                if (writeMethods.has(method as string) && neonModel) {
                  console.log(`[Dual-Write] Replicating ${String(prop)}.${String(method)} to both Local and Neon DBs`);
                  try {
                    const [localResult] = await Promise.all([
                      originalMethod.apply(modelTarget, args),
                      neonModel[method].apply(neonModel, args).catch((err: any) => {
                        console.error(`[Dual-Write Error] Failed to write to Neon for ${String(prop)}.${String(method)}:`, err);
                      }),
                    ]);
                    return localResult;
                  } catch (error) {
                    throw error;
                  }
                }
                return originalMethod.apply(modelTarget, args);
              };
            }
            return Reflect.get(modelTarget, method, modelReceiver);
          },
        });
      }
      return Reflect.get(target, prop, receiver);
    },
  });
};

export const prisma = (globalForPrisma.prisma ?? createProxy()) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
