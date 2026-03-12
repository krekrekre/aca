import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const weekStartStr = searchParams.get("start"); // ISO date

    if (!employeeId || !weekStartStr) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const start = new Date(weekStartStr);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const appointments = await prisma.appointment.findMany({
        where: {
            employeeId,
            status: { in: ["CONFIRMED", "PENDING"] },
            startTime: { gte: start, lte: end },
        },
        include: {
            service: { select: { title: true } },
            user: { select: { name: true } }
        }
    }) as any[];

    return NextResponse.json({ appointments });
}
