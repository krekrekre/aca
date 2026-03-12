const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Delete all users (cascades will handle related records)
    const deleted = await prisma.user.deleteMany({});
    console.log(`Successfully deleted ${deleted.count} users.`);

    // 2. Re-create the primary admin so you can still log in
    const passwordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Brica Admin",
        email: "admin@brica.com",
        passwordHash: passwordHash,
        role: "ADMIN",
      },
    });

    console.log("\nDefault admin account recreated:");
    console.log(`Email: ${admin.email}`);
    console.log("Password: admin123");
    
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
