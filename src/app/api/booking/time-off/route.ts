import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** GET ?employeeId=... - returns list of time-off dates (YYYY-MM-DD) for the employee so the booking calendar can show "Neradni dan". */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
        return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
    }

    const rows = await prisma.timeOff.findMany({
        where: { employeeId },
        select: { date: true, reason: true },
        orderBy: { date: "asc" },
    });

    const REASON_LABELS: Record<string, string> = {
        "Godisnji": "Godišnji",
        "Bolovanje": "Bolovanje",
        "Praznik": "Praznik",
        "Slobodan dan": "Slobodan dan"
    };

    const result = rows.map((r) => {
        const d = r.date;
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return { 
            date: `${y}-${m}-${day}`, 
            reason: REASON_LABELS[r.reason || ""] || r.reason || "Neradni dan" 
        };
    });

    return NextResponse.json({ dates: result });
}
