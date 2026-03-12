"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function cancelOwnAppointment(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id },
    });

    if (!appointment) throw new Error("Zakazivanje nije pronađeno.");
    if (appointment.status === "CANCELLED") return;

    // Check if it belongs to the user
    if (appointment.userId !== session.user.id) {
        throw new Error("Možete otkazati samo sopstvene termine.");
    }

    await prisma.appointment.update({
        where: { id },
        data: { status: "CANCELLED" },
    });

    revalidateTag("irregularSchedules", "max" as any);
    revalidatePath("/book");
}
