import prisma from "@/lib/prisma";
import CalendarView from "./_components/CalendarView";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCachedServices, getCachedEmployees, getCachedSettings } from "@/lib/data-fetching";

export default async function KalendarPage() {
  const session = await getServerSession(authOptions);
  
  // Optimize: Only fetch data for a reasonable range (e.g., last 30 days to next 60 days)
  const today = new Date();
  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - 30);
  const rangeEnd = new Date(today);
  rangeEnd.setDate(today.getDate() + 60);

  const [
    appointments,
    employees,
    schedules,
    irregularSchedules,
    timeOffs,
    users,
    services,
    settings,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        startTime: { gte: rangeStart, lte: rangeEnd }
      },
      select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          userId: true,
          employeeId: true,
          isPause: true,
          service: { select: { title: true } },
          user: { select: { name: true, phone: true } },
          employee: { select: { name: true } },
      },
    }) as Promise<any>,
    getCachedEmployees(),
    prisma.schedule.findMany(),
    prisma.irregularSchedule.findMany({ 
      where: {
        startDate: { lte: rangeEnd },
        endDate: { gte: rangeStart }
      },
      orderBy: { startDate: "asc" } 
    }),
    prisma.timeOff.findMany({
      where: {
        date: { gte: rangeStart, lte: rangeEnd }
      }
    }),
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, phone: true, email: true },
      orderBy: { name: "asc" },
    }),
    getCachedServices(),
    getCachedSettings(),
  ]);

  const calendarFieldDurationMinutes = settings?.appointmentDuration ?? 30;

  return (
    <div>
      <CalendarView
        appointments={appointments}
        employees={employees}
        schedules={schedules}
        irregularSchedules={irregularSchedules}
        timeOffs={timeOffs}
        users={users}
        services={services}
        defaultFieldDurationMinutes={calendarFieldDurationMinutes}
        currentUser={session?.user ? { id: session.user.id, role: session.user.role } : undefined}
      />
    </div>
  );
}
