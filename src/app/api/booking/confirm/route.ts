import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    const body = await request.json();
    const { employeeId, serviceId, startTime, extraServiceIds = [] } = body;

    if (!employeeId || !serviceId || !startTime) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const start = new Date(startTime);

    // 1. Parallelize fetches
    const [session, settings, service, extras] = await Promise.all([
        getServerSession(authOptions),
        prisma.settings.findFirst({ select: { maxBookingsPerMonth: true } }),
        prisma.service.findUnique({ 
            where: { id: serviceId },
            include: { extraServices: true }
        }),
        extraServiceIds.length > 0 
            ? prisma.extraService.findMany({ where: { id: { in: extraServiceIds } } })
            : Promise.resolve([])
    ]);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    if (!service) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const totalExtraDuration = extras.reduce((sum, e) => sum + e.duration, 0);
    const end = new Date(start.getTime() + (service.duration + totalExtraDuration) * 60000);

    const extraServicesData = extras.map(e => ({
        id: e.id,
        title: e.title,
        price: e.price,
        duration: e.duration
    }));

    // 2. Count user bookings (needs userId from session)
    const userBookingsCount = await prisma.appointment.count({
        where: {
            userId,
            status: "CONFIRMED",
            startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
    });

    const maxBookings = settings?.maxBookingsPerMonth ?? 5;

    if (userBookingsCount >= maxBookings) {
        return NextResponse.json({ 
            error: `Dostigli ste maksimalan broj rezervacija (${maxBookings}) za period od 30 dana.` 
        }, { status: 400 });
    }

    // 2. Validate Double-Booking (Concurrency Control)
    try {
        const appointment = await prisma.$transaction(async (tx) => {
            const conflict = await tx.appointment.findFirst({
                where: {
                    employeeId,
                    status: "CONFIRMED",
                    OR: [
                        { startTime: { lte: start }, endTime: { gt: start } },
                        { startTime: { lt: end }, endTime: { gte: end } },
                        { startTime: { gte: start }, endTime: { lte: end } }
                    ]
                },
                select: { id: true }
            });

            if (conflict) {
                throw new Error("This time slot is no longer available.");
            }

             return await tx.appointment.create({
                data: {
                    userId,
                    employeeId,
                    serviceId,
                    startTime: start,
                    endTime: end,
                    status: "CONFIRMED",
                    extraServices: extraServicesData,
                }
            });
        });

        return NextResponse.json({ success: true, appointment });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to book appointment" }, { status: 400 });
    }
}
