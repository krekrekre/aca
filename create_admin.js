const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@brica.com" },
      update: { role: "ADMIN" },
      create: {
        name: "Brica Admin",
        email: "admin@brica.com",
        passwordHash: passwordHash,
        role: "ADMIN",
      },
    });
    console.log("Admin user created/updated successfully:");
    console.log(`Email: ${admin.email}`);
    console.log("Password: admin123");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
