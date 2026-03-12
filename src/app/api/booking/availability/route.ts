import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const startDateStr = searchParams.get("startDate"); 
    const endDateStr = searchParams.get("endDate");
    const stepMinutes = Math.min(120, Math.max(5, parseInt(searchParams.get("stepMinutes") ?? "15", 10) || 15));

    if (!employeeId || !startDateStr || !endDateStr) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setUTCHours(23, 59, 59, 999);

    const [allSchedules, allIrregularSchedules, allTimeOffs, existingAppointments] = await Promise.all([
        prisma.schedule.findMany({ where: { employeeId } }),
        prisma.irregularSchedule.findMany({
            where: {
                employeeId,
                startDate: { lte: endDate },
                endDate: { gte: startDate },
            },
        }),
        prisma.timeOff.findMany({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate },
            },
        }),
        prisma.appointment.findMany({
            where: {
                employeeId,
                status: { in: ["CONFIRMED", "PENDING"] },
                startTime: { lt: endDate },
                endTime: { gt: startDate },
            },
            orderBy: { startTime: 'asc' }
        }),
    ]);

    const availabilityByDate: Record<string, { time: string; maxDuration: number }[]> = {};
    
    let currentDayIter = new Date(startDate);
    while (currentDayIter <= endDate) {
        // Date part for the key should be based on the intended local day
        const y = currentDayIter.getFullYear();
        const m = currentDayIter.getMonth();
        const d = currentDayIter.getDate();
        
        const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayOfWeek = currentDayIter.getDay();

        // Check for TimeOff for this day
        const isTimeOff = allTimeOffs.some(to => {
            const dObj = new Date(to.date);
            return dObj.getFullYear() === y && dObj.getMonth() === m && dObj.getDate() === d;
        });

        if (isTimeOff) {
            availabilityByDate[dateKey] = [];
        } else {
            const ranges: { start: number; end: number }[] = [];
            
            // 1. Check Irregular Schedules FIRST
            allIrregularSchedules.forEach(ir => {
                const sDate = new Date(ir.startDate);
                const eDate = new Date(ir.endDate);
                
                // Compare only date parts locally
                const sKey = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, "0")}-${String(sDate.getDate()).padStart(2, "0")}`;
                const eKey = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, "0")}-${String(eDate.getDate()).padStart(2, "0")}`;
                
                if (dateKey >= sKey && dateKey <= eKey) {
                    ranges.push({ start: timeToMinutes(ir.startTime), end: timeToMinutes(ir.endTime) });
                }
            });

            // 2. If no irregular schedule, only then check Regular Schedule
            if (ranges.length === 0) {
                allSchedules.filter(s => s.dayOfWeek === dayOfWeek).forEach(s => {
                    ranges.push({ start: timeToMinutes(s.startTime), end: timeToMinutes(s.endTime) });
                });
            }

            if (ranges.length === 0) {
                availabilityByDate[dateKey] = [];
            } else {
                // For overlap checks, we need absolute UTC boundaries for this local day
                // Belgrade is CET (UTC+1)
                const belgOffset = 1; 
                const dayStartUTC = new Date(Date.UTC(y, m, d, -belgOffset, 0, 0, 0));
                const dayEndUTC = new Date(Date.UTC(y, m, d, 23 - belgOffset, 59, 59, 999));
                
                const dayApts = existingAppointments.filter(apt => 
                    apt.startTime < dayEndUTC && apt.endTime > dayStartUTC
                );

                const daySlots: { time: string; maxDuration: number }[] = [];

                ranges.forEach(range => {
                    let currentSlotTime = new Date(Date.UTC(y, m, d, Math.floor(range.start / 60) - belgOffset, range.start % 60, 0, 0));
                    const rangeEndLimit = new Date(Date.UTC(y, m, d, Math.floor(range.end / 60) - belgOffset, range.end % 60, 0, 0)).getTime();

                    while (currentSlotTime.getTime() < rangeEndLimit) {
                        const conflictingApt = dayApts.find(apt =>
                            currentSlotTime.getTime() >= apt.startTime.getTime() &&
                            currentSlotTime.getTime() < apt.endTime.getTime()
                        );

                        if (conflictingApt) {
                            currentSlotTime = new Date(conflictingApt.endTime.getTime());
                            continue;
                        }

                        const nextApt = dayApts.find(apt => apt.startTime.getTime() > currentSlotTime.getTime() && apt.startTime.getTime() < rangeEndLimit);
                        const endTimeLimit = nextApt ? nextApt.startTime.getTime() : rangeEndLimit;
                        const maxDuration = Math.floor((endTimeLimit - currentSlotTime.getTime()) / 60000);

                        if (maxDuration >= stepMinutes) {
                            // Buffer to allow booking "today" if close to start
                            if (currentSlotTime.getTime() > Date.now() - 5 * 60 * 1000) {
                                daySlots.push({ time: currentSlotTime.toISOString(), maxDuration });
                            }
                        }
                        
                        currentSlotTime = new Date(currentSlotTime.getTime() + stepMinutes * 60000);
                    }
                });
                
                daySlots.sort((a, b) => a.time.localeCompare(b.time));
                availabilityByDate[dateKey] = daySlots;
            }
        }
        currentDayIter.setDate(currentDayIter.getDate() + 1);
    }

    return NextResponse.json({ availability: availabilityByDate });
}

function timeToMinutes(s: string): number {
    const [h, m] = s.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}
