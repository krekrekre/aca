import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@brica.com" },
        update: {},
        create: {
            name: "Brica Admin",
            email: "admin@brica.com",
            passwordHash: passwordHash,
            role: "ADMIN",
        },
    });

    console.log("Admin user secured:");
    console.log(`Email: ${admin.email}`);
    console.log("Password: admin123");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
