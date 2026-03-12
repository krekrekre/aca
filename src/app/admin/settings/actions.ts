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

export async function updateSettings(formData: FormData) {
    await checkAdmin();

    const maxBookingAdvanceDays = parseInt(formData.get("maxBookingAdvanceDays") as string);
    const appointmentDuration = parseInt(formData.get("appointmentDuration") as string);
    const maxBookingsPerMonth = parseInt(formData.get("maxBookingsPerMonth") as string);

    const existingSettings = await prisma.settings.findFirst();

    if (existingSettings) {
        await prisma.settings.update({
            where: { id: existingSettings.id },
            data: { maxBookingAdvanceDays, appointmentDuration, maxBookingsPerMonth },
        });
    } else {
        await prisma.settings.create({
            data: { maxBookingAdvanceDays, appointmentDuration, maxBookingsPerMonth },
        });
    }

    (revalidateTag as any)("settings");
    revalidatePath("/admin/settings");
    revalidatePath("/book");
}
