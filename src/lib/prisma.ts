import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

type PrismaClientExtended = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientExtended | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma as PrismaClientExtended;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma as PrismaClientExtended;
