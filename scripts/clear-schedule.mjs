/**
 * Clear all appointments and time-offs (free days) from the database.
 * Run from project root: node scripts/clear-schedule.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [appointments, timeOffs] = await Promise.all([
    prisma.appointment.deleteMany({}),
    prisma.timeOff.deleteMany({}),
  ]);
  console.log(`Deleted ${appointments.count} appointment(s) and ${timeOffs.count} time-off/free day(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
