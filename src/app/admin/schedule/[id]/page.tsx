import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { unstable_noStore } from "next/cache";
import styles from "../../admin.module.css";
import ScheduleForm from "./_components/ScheduleForm";
import { getIrregularSchedules } from "../actions";

export const dynamic = "force-dynamic";

export default async function EmployeeSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  unstable_noStore();
  const { id } = await params;

  const employee = await prisma.user.findUnique({
    where: { id },
  });

  if (!employee || employee.role !== "EMPLOYEE") {
    notFound();
  }

  const [irregularSchedules, timeOffs, appointments] = await Promise.all([
    getIrregularSchedules(employee.id),
    prisma.timeOff.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        employeeId: employee.id,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }) as Promise<any[]>,
  ]);

  const initialIrregular = irregularSchedules.map((s) => {
    const d1 = s.startDate;
    const y1 = d1.getUTCFullYear();
    const m1 = String(d1.getUTCMonth() + 1).padStart(2, "0");
    const day1 = String(d1.getUTCDate()).padStart(2, "0");
    
    const d2 = s.endDate;
    const y2 = d2.getUTCFullYear();
    const m2 = String(d2.getUTCMonth() + 1).padStart(2, "0");
    const day2 = String(d2.getUTCDate()).padStart(2, "0");
    
    return {
      id: s.id,
      startDate: `${y1}-${m1}-${day1}`,
      endDate: `${y2}-${m2}-${day2}`,
      startTime: s.startTime,
      endTime: s.endTime,
    };
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Raspored</h1>
        <p className={styles.pageDescription}>
          Postavite radno vreme za zaposlenog.
        </p>
      </div>

      <div className={styles.card} style={{ maxWidth: "40%" }}>
        <ScheduleForm
          employeeId={employee.id}
          employeeName={employee.name}
          initialIrregular={initialIrregular}
          initialTimeOffs={timeOffs.map((t) => {
            const d = t.date;
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, "0");
            const day = String(d.getUTCDate()).padStart(2, "0");
            return { id: t.id, date: `${y}-${m}-${day}`, reason: t.reason || "" };
          })}
          appointments={appointments.map((a) => ({
            id: a.id,
            startTime: a.startTime.toISOString(),
            endTime: a.endTime.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
