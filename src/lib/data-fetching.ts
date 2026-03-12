import { unstable_cache } from "next/cache";
import prisma from "./prisma";

export const getCachedServices = unstable_cache(
  async () => {
    return prisma.service.findMany({ 
      orderBy: { createdAt: "asc" },
      include: { extraServices: true }
    });
  },
  ["services"],
  { revalidate: 3600, tags: ["services"] }
);

export const getCachedEmployees = unstable_cache(
  async () => {
    return prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      orderBy: { createdAt: "asc" },
    });
  },
  ["employees"],
  { revalidate: 3600, tags: ["employees"] }
);

export const getCachedSettings = unstable_cache(
  async () => {
    return prisma.settings.findFirst();
  },
  ["settings"],
  { revalidate: 3600, tags: ["settings"] }
);

export const getCachedSchedules = unstable_cache(
  async () => {
    return prisma.schedule.findMany();
  },
  ["schedules"],
  { revalidate: 3600, tags: ["schedules"] }
);

export const getCachedIrregularSchedules = unstable_cache(
  async () => {
    return prisma.irregularSchedule.findMany({ orderBy: { startDate: "asc" } });
  },
  ["irregularSchedules"],
  { revalidate: 3600, tags: ["irregularSchedules"] }
);
