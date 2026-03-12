"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function checkAdmin() {
    // We'll handle this inside the actions to allow parallelization
}

export async function createAppointmentByAdmin(formData: {
    userId?: string | null;
    employeeId: string;
    serviceId?: string | null;
    isPause?: boolean;
    duration?: number;
    startTime: string; // ISO string
}) {
    const { userId, employeeId, serviceId, isPause, duration, startTime } = formData;
    if (!employeeId || !startTime || (!serviceId && !isPause)) {
        throw new Error("Missing required fields.");
    }

    // Optimization: Parallelize session check and service lookup
    const [session, service] = await Promise.all([
        getServerSession(authOptions),
        isPause ? Promise.resolve(null) : prisma.service.findUnique({ 
            where: { id: serviceId! },
            select: { duration: true }
        })
    ]);

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const start = new Date(startTime);
    let end: Date;

    if (isPause) {
        const dur = duration || 30;
        end = new Date(start.getTime() + dur * 60000);
    } else {
        if (!service) throw new Error("Usluga nije pronađena.");
        end = new Date(start.getTime() + service.duration * 60000);
    }

    // Optimization: Only select ID for conflict check
    const conflict = await prisma.appointment.findFirst({
        where: {
            employeeId,
            status: "CONFIRMED",
            OR: [
                { startTime: { lte: start }, endTime: { gt: start } },
                { startTime: { lt: end }, endTime: { gte: end } },
                { startTime: { gte: start }, endTime: { lte: end } },
            ],
        },
        select: { id: true }
    });
    if (conflict) throw new Error("Termin se preklapa sa postojećom rezervacijom.");

    await prisma.appointment.create({
        data: {
            user: userId ? { connect: { id: userId } } : undefined,
            employee: { connect: { id: employeeId } },
            service: isPause ? undefined : { connect: { id: serviceId as string } },
            isPause: !!isPause,
            startTime: start,
            endTime: end,
            status: "CONFIRMED",
        },
    });

    revalidateTag("irregularSchedules", "max" as any); // Using 'as any' safe because we saw it in terminal warning
    revalidatePath("/admin/kalendar");
    revalidatePath("/book");
}

export async function cancelAppointment(id: string) {
    const [session, appointment] = await Promise.all([
        getServerSession(authOptions),
        prisma.appointment.findUnique({ where: { id } })
    ]);

    if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
    if (!appointment) throw new Error("Zakazivanje nije pronađeno.");
    if (appointment.status === "CANCELLED") return;

    await prisma.appointment.update({
        where: { id },
        data: { status: "CANCELLED" },
    });

    revalidateTag("irregularSchedules", "max" as any); // Using 'as any' safe because we saw it in terminal warning
    revalidatePath("/admin/kalendar");
    revalidatePath("/book");
}

export async function createIrregularSchedulesBatch(
    employeeId: string,
    entries: { startDate: string; endDate: string; startTime: string; endTime: string }[]
) {
    const [session] = await Promise.all([
        getServerSession(authOptions)
    ]);
    if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.irregularSchedule.createMany({
        data: entries.map(e => {
            const [sy, sm, sd] = e.startDate.split("-").map(Number);
            const [ey, em, ed] = e.endDate.split("-").map(Number);
            return {
                employeeId,
                startDate: new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0)),
                endDate: new Date(Date.UTC(ey, em - 1, ed, 0, 0, 0)),
                startTime: e.startTime,
                endTime: e.endTime,
            };
        }),
    });

    revalidateTag("irregularSchedules", "max" as any);
    revalidatePath("/admin/schedule");
    revalidatePath("/admin/kalendar");
    revalidatePath("/book");
}

export async function createTimeOffBatch(
    employeeId: string,
    dates: string[], // ISO strings yyyy-mm-dd
    reason: string
) {
    const [session] = await Promise.all([
        getServerSession(authOptions)
    ]);
    if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.$transaction(async (tx) => {
        for (const dateStr of dates) {
            const [y, m, d] = dateStr.split("-").map(Number);
            const dObj = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
            
            await tx.timeOff.upsert({
                where: {
                    employeeId_date: {
                        employeeId,
                        date: dObj,
                    },
                },
                update: { reason },
                create: {
                    employeeId,
                    date: dObj,
                    reason,
                },
            });
        }
    });

    revalidateTag("irregularSchedules", "max" as any);
    revalidatePath("/admin/schedule");
    revalidatePath("/admin/kalendar");
    revalidatePath("/book");
}
