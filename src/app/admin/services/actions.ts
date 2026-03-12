"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createService(
  formData: FormData,
): Promise<{ error?: string }> {
  await checkAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string);
  const price = parseFloat(formData.get("price") as string);

  const extrasCount = parseInt(formData.get("extrasCount") as string || "0");
  const extraServices = [];
  for (let i = 0; i < extrasCount; i++) {
    const title = formData.get(`extraTitle_${i}`) as string;
    const duration = parseInt(formData.get(`extraDuration_${i}`) as string || "0");
    const price = parseFloat(formData.get(`extraPrice_${i}`) as string || "0");
    if (title) {
      extraServices.push({ title, duration, price });
    }
  }

  await prisma.service.create({
    data: {
      title,
      description,
      duration,
      price,
      extraServices: {
        create: extraServices,
      },
    },
  });

  (revalidateTag as any)("services");
  revalidatePath("/admin/services");
  revalidatePath("/book");
  return {};
}

export async function updateService(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await checkAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string);
  const price = parseFloat(formData.get("price") as string);

  const extrasCount = parseInt(formData.get("extrasCount") as string || "0");
  const extraServices = [];
  for (let i = 0; i < extrasCount; i++) {
    const title = formData.get(`extraTitle_${i}`) as string;
    const duration = parseInt(formData.get(`extraDuration_${i}`) as string || "0");
    const price = parseFloat(formData.get(`extraPrice_${i}`) as string || "0");
    if (title) {
      extraServices.push({ title, duration, price });
    }
  }

  await prisma.$transaction([
    prisma.extraService.deleteMany({ where: { serviceId: id } }),
    prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        duration,
        price,
        extraServices: {
          create: extraServices,
        },
      },
    }),
  ]);

  (revalidateTag as any)("services");
  revalidatePath("/admin/services");
  revalidatePath("/book");
  return {};
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  await checkAdmin();

  const now = new Date();
  const futureAppointmentCount = await prisma.appointment.count({
    where: {
      serviceId: id,
      status: { in: ["CONFIRMED", "PENDING"] },
      startTime: { gt: now },
    },
  });
  if (futureAppointmentCount > 0) {
    return {
      error:
        "Ne možete obrisati uslugu koja ima buduća zakazivanja. Otkažite ih prvo.",
    };
  }

  // Remove past/cancelled appointments that reference this service so the FK allows service delete
  await prisma.appointment.deleteMany({
    where: { serviceId: id },
  });

  await prisma.service.delete({
    where: { id },
  });

  (revalidateTag as any)("services");
  revalidatePath("/admin/services");
  revalidatePath("/book");
  return {};
}
