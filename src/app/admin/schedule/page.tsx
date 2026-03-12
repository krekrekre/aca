import prisma from "@/lib/prisma";
import styles from "../admin.module.css";
import ScheduleForm from "./[id]/_components/ScheduleForm";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
    // 1. Cleanup: Delete entries older than 7 days
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 7);
    thresholdDate.setHours(0, 0, 0, 0);

    try {
        await Promise.all([
            prisma.irregularSchedule.deleteMany({
                where: { endDate: { lt: thresholdDate } }
            }),
            prisma.timeOff.deleteMany({
                where: { date: { lt: thresholdDate } }
            })
        ]);
    } catch (err) {
        console.error("Cleanup failed:", err);
    }

    const employees = await prisma.user.findMany({
        where: { role: "EMPLOYEE" },
        orderBy: { createdAt: "asc" },
    });

    const employeeIds = employees.map((e) => e.id);

    const [allIrregularSchedules, allTimeOffs, allAppointments] = await Promise.all([
        prisma.irregularSchedule.findMany({
            where: { employeeId: { in: employeeIds } },
        }),
        prisma.timeOff.findMany({
            where: { employeeId: { in: employeeIds } },
            orderBy: { date: "asc" },
        }),
        prisma.appointment.findMany({
            where: {
                employeeId: { in: employeeIds },
                status: { in: ["CONFIRMED", "PENDING"] },
            },
        }) as Promise<any[]>,
    ]);

    // Group appointments by employeeId
    const appointmentsByEmployee = allAppointments.reduce((acc, app) => {
        if (!acc[app.employeeId]) acc[app.employeeId] = [];
        acc[app.employeeId].push({
            id: app.id,
            startTime: app.startTime.toISOString(),
            endTime: app.endTime.toISOString(),
        });
        return acc;
    }, {} as Record<string, { id: string; startTime: string; endTime: string }[]>);

    // Group irregular schedules by employeeId and serialize dates
    const irregularByEmployee = allIrregularSchedules.reduce((acc, schedule) => {
        if (!acc[schedule.employeeId]) acc[schedule.employeeId] = [];
        acc[schedule.employeeId].push({
            id: schedule.id,
            startDate: schedule.startDate.toISOString(),
            endDate: schedule.endDate.toISOString(),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
        });
        return acc;
    }, {} as Record<string, any[]>);

    // Group time offs by employeeId and serialize dates
    const timeOffsByEmployee = allTimeOffs.reduce((acc, to) => {
        if (!acc[to.employeeId]) acc[to.employeeId] = [];
        const d = to.date;
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        acc[to.employeeId].push({
            id: to.id,
            date: `${y}-${m}-${day}`,
            reason: to.reason || "",
        });
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Upravljanje Rasporedom</h1>
                <p className={styles.pageDescription}>
                    Izaberite zaposlenog da upravljate njegovim nedeljnim rasporedom i odmorima.
                </p>
            </div>

            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(min(470px, 100%), 1fr))", 
                gap: "1.5rem",
                alignItems: "start" 
            }}>
                {employees.length === 0 ? (
                    <p style={{ color: "var(--text-secondary)" }}>
                        Nema pronađenih zaposlenih. Molimo vas da prvo dodate zaposlene.
                    </p>
                ) : (
                    employees.map((employee) => (
                        <div key={employee.id} id={`employee-${employee.id}`} className={styles.card} style={{ padding: 0, overflow: "hidden", margin: 0 }}>
                             <ScheduleForm
                                employeeId={employee.id}
                                employeeName={employee.name || "Nepoznato"}
                                initialIrregular={irregularByEmployee[employee.id] || []}
                                initialTimeOffs={timeOffsByEmployee[employee.id] || []}
                                appointments={appointmentsByEmployee[employee.id] || []}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
