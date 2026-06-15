import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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
        const localModel = (target as unknown as Record<string, unknown>)[prop];
        const neonModel = prismaNeon ? (prismaNeon as unknown as Record<string, unknown>)[prop] : null;

        return new Proxy(localModel as object, {
          get(modelTarget, method, modelReceiver) {
            const originalMethod = (modelTarget as Record<string, unknown>)[method as string];
            if (typeof originalMethod === 'function') {
              const typedMethod = originalMethod as (...args: unknown[]) => Promise<unknown>;
              return async function (...args: unknown[]) {
                if (writeMethods.has(method as string) && neonModel) {
                  console.log(`[Dual-Write] Replicating ${String(prop)}.${String(method)} to both Local and Neon DBs`);
                  try {
                    const [localResult] = await Promise.all([
                      typedMethod.bind(modelTarget)(...args),
                      (neonModel as Record<string, (...args: unknown[]) => Promise<unknown>>)[method as string](...args).catch((err: unknown) => {
                        console.error(`[Dual-Write Error] Failed to write to Neon for ${String(prop)}.${String(method)}:`, err);
                      }),
                    ]);
                    return localResult;
                  } catch (error) {
                    throw error;
                  }
                }
                return typedMethod.bind(modelTarget)(...args);
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
