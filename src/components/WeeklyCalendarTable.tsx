"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfWeek,
  addDays,
  addMinutes,
  setHours,
  setMinutes,
  format,
  isSameDay,
  isBefore,
} from "date-fns";

// Serbian: index = JS getDay() (0=Sun, 1=Mon, ...)
const DAY_NAMES = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
const MONTH_NAMES = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "jun",
  "jul",
  "avgust",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

export type Schedule = {
  employeeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};
export type IrregularSchedule = {
  employeeId: string;
  startDate: Date | string;
  endDate: Date | string;
  startTime: string;
  endTime: string;
};
export type TimeOff = {
  id?: string;
  employeeId: string;
  date: Date | string;
  reason?: string | null;
};
export type Appointment = {
  id: string;
  userId?: string | null;
  employeeId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  user?: { name: string; phone?: string | null };
  service?: { title: string } | null;
  isPause?: boolean;
};

export interface WeeklyCalendarTableAdminProps {
  weekStart: Date;
  slotDurationMinutes: number;
  employeeId: string;
  schedules: Schedule[];
  irregularSchedules?: IrregularSchedule[];
  timeOffs: TimeOff[];
  appointments: Appointment[];
  currentUser?: { id?: string; role?: string };
  onSlotSelect: (start: Date, end: Date, maxDuration?: number) => void;
  /** When provided, clicking a booked slot calls this (e.g. admin cancel) */
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeOffClick?: (timeOff: TimeOff) => void;
  /** When provided, used instead of schedules/timeOffs/appointments to determine clickable cells (booking flow) */
  availabilityByDate?: Record<string, { time: string; maxDuration: number }[]>;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onDayClick?: (date: Date) => void;
  selectionMode?: "none" | "working_hours" | "time_off";
  selectedSlots?: Set<string>;
  onSlotToggle?: (slotId: string) => void;
}

function getWeekStart(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 });
}

function formatWeekSpan(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const d1 = weekStart.getDate();
  const d2 = end.getDate();
  const month = MONTH_NAMES[end.getMonth()];
  const year = end.getFullYear();
  return `${d1}. - ${d2}. ${month} ${year}.`;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

const DEFAULT_MIN_HOUR = 7;
const DEFAULT_MAX_HOUR = 20;

/** Check if a date falls within an irregular schedule's date range (compare date parts only) */
function dateInRange(date: Date, startDate: Date | string, endDate: Date | string): boolean {
  const toYMD = (d: Date | string) => {
    if (typeof d === "string") {
      // If it's a full ISO string, take the date part directly to avoid shift
      if (d.includes("T")) return d.split("T")[0];
      return d;
    }
    // For local Date objects (e.g. from the calendar loop), format() uses local time which is what we want
    return format(d, "yyyy-MM-dd");
  };
  const d = toYMD(date);
  const s = toYMD(startDate);
  const e = toYMD(endDate);
  return d >= s && d <= e;
}

export default function WeeklyCalendarTable({
  weekStart,
  slotDurationMinutes,
  employeeId,
  schedules,
  irregularSchedules = [],
  timeOffs,
  appointments,
  onSlotSelect,
  onAppointmentClick,
  onTimeOffClick,
  availabilityByDate,
  onPrevWeek,
  onNextWeek,
  onDayClick,
  selectionMode = "none",
  selectedSlots,
  onSlotToggle,
  currentUser,
}: WeeklyCalendarTableAdminProps) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [now, setNow] = useState(new Date());
  const touchedRef = useRef<Set<string>>(new Set());



  useEffect(() => {
    // Update 'now' every minute to keep the 'current' highlight accurate
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  const weekStartNorm = useMemo(() => getWeekStart(weekStart), [weekStart]);

  useEffect(() => {
    if (selectionMode === "none") return;
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      touchedRef.current.clear();
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [selectionMode]);

  const employeeAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.employeeId === employeeId &&
          (a.status?.toUpperCase() === "CONFIRMED" || a.status?.toUpperCase() === "PENDING"),
      ),
    [appointments, employeeId],
  );

  const { minMinutes, maxMinutes } = useMemo(() => {
    let min = 24 * 60;
    let max = 0;

    if (availabilityByDate) {
      for (const slots of Object.values(availabilityByDate)) {
        for (const s of slots) {
          const d = new Date(s.time);
          const minutes = d.getHours() * 60 + d.getMinutes();
          if (minutes < min) min = minutes;
          if (minutes > max) max = minutes;
        }
      }
    } else {
      const empSchedules = schedules.filter((s) => s.employeeId === employeeId);
      empSchedules.forEach((s) => {
        const start = timeToMinutes(s.startTime);
        const end = timeToMinutes(s.endTime);
        if (start < min) min = start;
        if (end > max) max = end;
      });

      const empIrregular = irregularSchedules.filter((s) => s.employeeId === employeeId);
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartNorm, i));
      weekDays.forEach((day) => {
        empIrregular.forEach((ir) => {
          if (dateInRange(day, ir.startDate, ir.endDate)) {
            const start = timeToMinutes(ir.startTime);
            const end = timeToMinutes(ir.endTime);
            if (start < min) min = start;
            if (end > max) max = end;
          }
        });
      });
    }

    // Always ensure existing appointments are visible within the grid
    employeeAppointments.forEach((a) => {
      const sDate = typeof a.startTime === "string" ? new Date(a.startTime) : a.startTime;
      const eDate = typeof a.endTime === "string" ? new Date(a.endTime) : a.endTime;
      const start = sDate.getHours() * 60 + sDate.getMinutes();
      const end = eDate.getHours() * 60 + eDate.getMinutes();
      if (start < min) min = start;
      if (end > max) max = end;
    });

    // Expand if admin is adding slots (Dodaj termin)
    if (selectionMode === "working_hours") {
      min = Math.min(min, 9 * 60);
      max = Math.max(max, 20 * 60);
    }

    if (min >= max) {
      return {
        minMinutes: DEFAULT_MIN_HOUR * 60,
        maxMinutes: DEFAULT_MAX_HOUR * 60,
      };
    }

    // For availability view, the max minutes in the data is the START of the last slot.
    // We need to add the duration to see the full interval.
    return {
      minMinutes: min,
      maxMinutes: availabilityByDate ? (max + slotDurationMinutes) : max
    };
  }, [schedules, employeeId, irregularSchedules, weekStartNorm, availabilityByDate, slotDurationMinutes, selectionMode, employeeAppointments]);

  const timeSlots = useMemo(() => {
    const slots: number[] = [];
    for (let m = minMinutes; m < maxMinutes; m += slotDurationMinutes) {
      slots.push(m);
    }
    return slots;
  }, [minMinutes, maxMinutes, slotDurationMinutes]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartNorm, i)),
    [weekStartNorm],
  );

  const employeeTimeOffMap = useMemo(() => {
    const map = new Map<string, TimeOff>();
    timeOffs
      .filter((t) => t.employeeId === employeeId)
      .forEach((t) => {
        let dateKey: string;
        if (typeof t.date === "string" && /^\d{4}-\d{2}-\d{2}/.test(t.date)) {
          const [y, m, d] = t.date.slice(0, 10).split("-").map(Number);
          dateKey = new Date(y, m - 1, d).toDateString();
        } else {
          const d = typeof t.date === "string" ? new Date(t.date) : t.date;
          dateKey = d.toDateString();
        }
        map.set(dateKey, t);
      });
    return map;
  }, [timeOffs, employeeId]);

  /** Combined "neradni dan" display: TimeOff (Neradni dani tab) + full-day off from IrregularSchedule (Nepravilno radno vreme with no hours) */
  const employeeTimeOffDisplayMap = useMemo(() => {
    const map = new Map<string, TimeOff>(employeeTimeOffMap);
    const empIrregular = irregularSchedules.filter((s) => s.employeeId === employeeId);
    days.forEach((day) => {
      if (map.has(day.toDateString())) return;
      const irregulars = empIrregular.filter((s) =>
        dateInRange(day, s.startDate, s.endDate),
      );
      if (irregulars.length === 0) return;
      const allZeroLength = irregulars.every((ir) => {
        const start = timeToMinutes(ir.startTime);
        const end = timeToMinutes(ir.endTime);
        return start >= end;
      });
      if (allZeroLength) {
        map.set(day.toDateString(), {
          employeeId,
          date: day,
          reason: "Neradni dan",
        });
      }
    });
    return map;
  }, [employeeTimeOffMap, irregularSchedules, employeeId, days]);


  const getSchedulesForDay = useCallback(
    (dayOfWeek: number) =>
      schedules.filter(
        (s) => s.employeeId === employeeId && s.dayOfWeek === dayOfWeek,
      ),
    [schedules, employeeId],
  );

  const getIrregularSchedulesForDate = useCallback(
    (day: Date) =>
      irregularSchedules.filter(
        (s) =>
          s.employeeId === employeeId && dateInRange(day, s.startDate, s.endDate),
      ),
    [irregularSchedules, employeeId],
  );

  const isSlotBooked = useCallback(
    (slotStart: Date, slotEnd: Date) => {
      return employeeAppointments.some((apt) => {
        const aptStart =
          typeof apt.startTime === "string"
            ? new Date(apt.startTime)
            : apt.startTime;
        const aptEnd =
          typeof apt.endTime === "string" ? new Date(apt.endTime) : apt.endTime;
        return (
          slotStart.getTime() < aptEnd.getTime() &&
          slotEnd.getTime() > aptStart.getTime()
        );
      });
    },
    [employeeAppointments],
  );

  const getAppointmentForSlot = useCallback(
    (slotStart: Date, slotEnd: Date): Appointment | undefined => {
      return employeeAppointments.find((apt) => {
        const aptStart =
          typeof apt.startTime === "string"
            ? new Date(apt.startTime)
            : apt.startTime;
        const aptEnd =
          typeof apt.endTime === "string" ? new Date(apt.endTime) : apt.endTime;
        return (
          slotStart.getTime() < aptEnd.getTime() &&
          slotEnd.getTime() > aptStart.getTime()
        );
      });
    },
    [employeeAppointments],
  );

  const getAvailabilitySlot = useCallback(
    (
      date: Date,
      slotStart: Date,
    ): { time: string; maxDuration: number } | undefined => {
      if (!availabilityByDate) return undefined;
      const dateStr = format(date, "yyyy-MM-dd");
      const slots = availabilityByDate[dateStr];
      if (!slots) return undefined;
      
      const targetHour = slotStart.getHours();
      const targetMin = slotStart.getMinutes();
      
      return slots.find((s) => {
        const d = new Date(s.time);
        // Compare total minutes from midnight to be timezone-independent 
        // as long as both client and server agree on the "wall clock" time.
        const dMinutes = d.getHours() * 60 + d.getMinutes();
        const targetMinutes = targetHour * 60 + targetMin;
        return dMinutes === targetMinutes;
      });
    },
    [availabilityByDate],
  );

  const isSlotAvailable = useCallback(
    (
      day: Date,
      slotStart: Date,
      slotEnd: Date,
    ): { available: boolean; maxDuration?: number } => {
      const dateStr = day.toDateString();
      if (employeeTimeOffMap.has(dateStr)) return { available: false };

      if (availabilityByDate) {
        const slot = getAvailabilitySlot(day, slotStart);
        if (slot && slot.maxDuration >= slotDurationMinutes) {
          return { available: true, maxDuration: slot.maxDuration };
        }
        return { available: false };
      }

      const irregulars = getIrregularSchedulesForDate(day);
      const slotStartMinutes =
        slotStart.getHours() * 60 + slotStart.getMinutes();
      const slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes();

      if (irregulars.length > 0) {
        const inAnyIrregular = irregulars.some((ir) => {
          const rangeStart = timeToMinutes(ir.startTime);
          const rangeEnd = timeToMinutes(ir.endTime);
          return (
            slotStartMinutes >= rangeStart && slotEndMinutes <= rangeEnd
          );
        });
        if (!inAnyIrregular) return { available: false };
        if (isSlotBooked(slotStart, slotEnd)) return { available: false };
        const maxEnd = Math.max(
          ...irregulars.map((ir) => timeToMinutes(ir.endTime)),
        );
        return {
          available: true,
          maxDuration: maxEnd - slotStartMinutes,
        };
      }

      const dayOfWeek = day.getDay();
      const schedulesForDay = getSchedulesForDay(dayOfWeek);
      if (schedulesForDay.length === 0) return { available: false };

      const inAnySchedule = schedulesForDay.some((s) => {
        const [startH, startM] = s.startTime.split(":").map(Number);
        const [endH, endM] = s.endTime.split(":").map(Number);
        const rangeStart = startH * 60 + startM;
        const rangeEnd = endH * 60 + endM;
        return slotStartMinutes >= rangeStart && slotEndMinutes <= rangeEnd;
      });
      if (!inAnySchedule) return { available: false };
      if (isSlotBooked(slotStart, slotEnd)) return { available: false };

      const maxEnd = Math.max(
        ...schedulesForDay.map((s) => {
          const [endH, endM] = s.endTime.split(":").map(Number);
          return endH * 60 + endM;
        })
      );
      const maxDuration = Math.floor((maxEnd - slotStartMinutes) / 1);
      return { available: true, maxDuration: maxDuration };
    },
    [
      employeeTimeOffMap,
      availabilityByDate,
      getSchedulesForDay,
      getIrregularSchedulesForDate,
      isSlotBooked,
      getAvailabilitySlot,
      slotDurationMinutes,
    ],
  );

  const handleInteraction = useCallback((day: Date, slotStart: Date, isDrag: boolean) => {
    if (selectionMode === "none" || !onSlotToggle) return;

    const dateKey = format(day, "yyyy-MM-dd");
    const minutes = slotStart.getHours() * 60 + slotStart.getMinutes();
    const slotId = selectionMode === "time_off"
      ? dateKey
      : `${dateKey}|${minutes}`;

    if (isDrag) {
      if (touchedRef.current.has(slotId)) return;
      touchedRef.current.add(slotId);
    }

    onSlotToggle(slotId);
  }, [selectionMode, onSlotToggle]);

  const handleCellClick = useCallback(
    (day: Date, slotStart: Date, slotEnd: Date, slotAppointment: Appointment | undefined, slotTimeOff: TimeOff | undefined) => {
      if (selectionMode !== "none") return;

      if (slotAppointment && onAppointmentClick) {
        onAppointmentClick(slotAppointment);
        return;
      }
      if (slotTimeOff && onTimeOffClick) {
        onTimeOffClick(slotTimeOff);
        return;
      }
      const { available, maxDuration } = isSlotAvailable(
        day,
        slotStart,
        slotEnd,
      );
      if (available) {
        onSlotSelect(slotStart, slotEnd, maxDuration);
      }
    },
    [isSlotAvailable, onSlotSelect, onAppointmentClick, onTimeOffClick, selectionMode],
  );

  const isPast = useCallback((d: Date, slotStart: Date) => {
    const now = new Date();
    return (
      isBefore(slotStart, now) ||
      (isSameDay(slotStart, now) && slotStart.getTime() <= now.getTime())
    );
  }, []);

  return (
    <div className="weekly-calendar-table">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          width: "100%",
          gap: "0.25rem",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onPrevWeek}
          disabled={!onPrevWeek}
          aria-label="Prethodna nedelja"
          style={{
            padding: "0.4rem",
            background: "transparent",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: onPrevWeek ? "pointer" : "default",
            opacity: onPrevWeek ? 1 : 0.4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
          onMouseOver={(e) => {
            if (onPrevWeek) {
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <span
          style={{
            fontSize: "clamp(0.9rem, 3vw, 1.25rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            padding: "0 0.25rem",
            textAlign: "center" as const,
          }}
        >
          {formatWeekSpan(weekStartNorm)}
        </span>
        <button
          type="button"
          onClick={onNextWeek}
          disabled={!onNextWeek}
          aria-label="Sledeća nedelja"
          style={{
            padding: "0.4rem",
            background: "transparent",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: onNextWeek ? "pointer" : "default",
            opacity: onNextWeek ? 1 : 0.4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
          onMouseOver={(e) => {
            if (onNextWeek) {
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      </div>

      <div
        style={{
          overflow: "auto",
          maxHeight: "calc(100vh - 280px)",
          minHeight: "320px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            minWidth: "600px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "56px",
                  padding: "0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  borderBottom: "1px solid var(--border)",
                  textAlign: "left",
                  position: "sticky",
                  top: 0,
                  background: "var(--surface)",
                  zIndex: 1,
                }}
              />
              {days.map((day) => {
                const isToday = isSameDay(day, now);
                return (
                  <th
                    key={day.toISOString()}
                    onClick={() => {
                      if (selectionMode === "working_hours" && onDayClick) {
                        onDayClick(day);
                      }
                    }}
                    style={{
                      padding: selectionMode === "working_hours" ? "4px" : "0.5rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: isToday ? "var(--accent)" : "var(--text-primary)",
                      borderBottom: isToday ? "2px solid var(--accent)" : "1px solid var(--border)",
                      textAlign: "center",
                      position: "sticky",
                      top: 0,
                      background: "var(--surface)",
                      zIndex: 1,
                      cursor: (selectionMode === "working_hours") ? "pointer" : "default",
                    }}
                  >
                    <div
                      style={{
                        padding: selectionMode === "working_hours" ? "4px" : "0",
                        border: selectionMode === "working_hours" ? "2px dashed rgba(34, 197, 94, 0.4)" : "1px solid transparent",
                        borderRadius: "var(--radius-sm)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        if (selectionMode === "working_hours") {
                          e.currentTarget.style.background = "rgba(34, 197, 94, 0.2)";
                          e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.8)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectionMode === "working_hours") {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.4)";
                        }
                      }}
                    >
                      <div style={{ opacity: isToday ? 1 : 0.7 }}>{DAY_NAMES[day.getDay()]}</div>
                      <div style={{
                        fontSize: "1.15rem",
                        marginTop: "0.25rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: isToday ? "var(--accent)" : "transparent",
                        color: isToday ? "var(--bg-color)" : "inherit",
                      }}>
                        {day.getDate()}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((minutes) => {
              const hour = Math.floor(minutes / 60);
              const min = minutes % 60;
              return (
                <tr key={minutes}>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      borderBottom: "1px solid var(--border)",
                      verticalAlign: "middle",
                    }}
                  >
                    {format(
                      setMinutes(setHours(new Date(2000, 0, 1), hour), min),
                      "HH:mm",
                    )}
                  </td>
                  {days.map((day) => {
                    const slotStart = new Date(day);
                    slotStart.setHours(hour, min, 0, 0);
                    const slotEnd = addMinutes(slotStart, slotDurationMinutes);
                    const { available } = isSlotAvailable(
                      day,
                      slotStart,
                      slotEnd,
                    );
                    const isCurrentSlot = now >= slotStart && now < slotEnd;
                    const hasIrregularForDay =
                      getIrregularSchedulesForDate(day).length > 0;
                    const inWorkingHours =
                      (getSchedulesForDay(day.getDay()).length > 0 || hasIrregularForDay) &&
                      !employeeTimeOffDisplayMap.has(day.toDateString());
                    const timeOffData = employeeTimeOffDisplayMap.get(day.toDateString());
                    const timeOffReason = timeOffData?.reason;
                    const isBookedInInterval = isSlotBooked(slotStart, slotEnd);
                    // Always identify if there's an appointment here
                    const booked = isBookedInInterval;
                    const slotAppointment = booked ? getAppointmentForSlot(slotStart, slotEnd) : undefined;

                    const dateKey = format(day, "yyyy-MM-dd");
                    const slotId = `${dateKey}|${minutes}`;
                    const isSelected = selectionMode === "time_off"
                      ? selectedSlots?.has(dateKey)
                      : selectedSlots?.has(slotId);
                    const isPastSlot = isPast(day, slotStart);
                    // If availabilityByDate is present (booking flow), trust the 'available' flag 
                    // from the server which already filtered past slots.
                    const clickableEmpty = available;

                    const isOwnApt = slotAppointment?.userId === currentUser?.id;
                    const canClickApt = availabilityByDate ? (isOwnApt && !isPastSlot) : !!onAppointmentClick;
                    const clickableBooked = booked && canClickApt;
                    const clickableTimeOff = timeOffData && onTimeOffClick; // Allow admin to click even if past?

                    let clickable: boolean = !!(clickableEmpty || clickableBooked || clickableTimeOff);
                    
                    // Only enforce client-side "past" check if NOT in booking flow (where server handles it)
                    if (!availabilityByDate && isPastSlot && !isCurrentSlot) {
                      clickable = false;
                    }

                    if (selectionMode === "working_hours") {
                      // Admin can click fields that are NOT bookable yet and NOT in the past
                      clickable = !available && !booked && !timeOffData && !isPastSlot;
                    } else if (selectionMode === "time_off") {
                      // Click anything that's NOT already time off and NOT in the past
                      // AND the day must NOT have any appointments (except cancelled)
                      // AND the day must NOT have any irregular schedules ("open slots")
                      const hasAppointmentsOnDay = employeeAppointments.some(apt => {
                        if (apt.status === "CANCELLED") return false;
                        const aptStart = typeof apt.startTime === "string" ? new Date(apt.startTime) : apt.startTime;
                        return isSameDay(aptStart, day);
                      });
                      clickable = !timeOffData && !isPastSlot && !hasAppointmentsOnDay && !hasIrregularForDay;
                    }

                    const disabled = !clickable;

                    return (
                      <td
                        key={day.toISOString()}
                        style={{
                          padding: "2px",
                          borderBottom: "1px solid var(--border)",
                          borderLeft: "1px solid var(--border)",
                          verticalAlign: "top",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleCellClick(day, slotStart, slotEnd, slotAppointment, timeOffData)
                          }
                          onMouseDown={(e) => {
                            if (e.button !== 0) return;
                            if (selectionMode !== "none") {
                              setIsMouseDown(true);
                              handleInteraction(day, slotStart, false);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isMouseDown && selectionMode !== "none") {
                              handleInteraction(day, slotStart, true);
                            }
                          }}
                          disabled={disabled}
                          style={{
                            width: "100%",
                            height: "64px",
                            minHeight: "64px",
                            maxHeight: "64px",
                            padding: "0.5rem",
                            border: isCurrentSlot
                              ? "1.5px dashed rgba(34, 197, 94, 0.6)"
                              : booked
                                ? (currentUser?.role === "ADMIN" ? "none" : (slotAppointment?.userId === currentUser?.id ? "2px solid #3b82f6" : "1px solid rgba(25, 50, 85, 1)"))
                                : "none",
                            borderRadius: "4px",
                            cursor: clickable ? "pointer" : "default",
                            fontSize: "0.8rem",
                            transition: "background 0.15s, border-color 0.15s",
                            background:
                              isSelected
                                ? "var(--accent)"
                                : selectionMode === "working_hours" && clickable
                                  ? "rgba(34, 197, 94, 0.15)" // light green
                                  : timeOffReason
                                    ? "repeating-linear-gradient(-45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.1) 6px, rgba(59, 130, 246, 0.18) 6px, rgba(59, 130, 246, 0.18) 12px)"
                                    : selectionMode === "time_off" && disabled && !timeOffReason
                                      ? "repeating-linear-gradient(-45deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.05) 6px, rgba(239, 68, 68, 0.1) 6px, rgba(239, 68, 68, 0.1) 12px)"
                                      : disabled && !booked && selectionMode === "none"
                                        ? (availabilityByDate ? "repeating-linear-gradient(-45deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.05) 6px, rgba(0,0,0,0.05) 12px)" : "repeating-linear-gradient(-45deg, rgba(0,0,0,0.22), rgba(0,0,0,0.22) 6px, rgba(0,0,0,0.12) 6px, rgba(0,0,0,0.12) 12px)")
                                        : booked
                                          ? (slotAppointment?.userId === currentUser?.id ? "rgba(59, 130, 246, 0.25)" : "rgba(25, 50, 85, 0.92)")
                                          : "rgba(128,128,128,0.2)",
                            color: isSelected
                              ? "var(--bg-color)"
                              : booked
                                ? (slotAppointment?.userId === currentUser?.id ? "var(--text-primary)" : "#d4af37")
                                : disabled && selectionMode === "none"
                                  ? "transparent"
                                  : "var(--text-primary)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            opacity: (isPastSlot && !isCurrentSlot && !available) ? 0.4 : 1,
                            filter: (isPastSlot && !isCurrentSlot && !available) ? "grayscale(40%)" : "none",
                          }}
                          onMouseOver={(e) => {
                            if (!clickable || isSelected) return;
                            if (booked) {
                              if (slotAppointment?.userId === currentUser?.id) {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.4)";
                              } else if (currentUser?.role === "ADMIN") {
                                e.currentTarget.style.background = "rgba(25, 50, 85, 1)";
                              }
                            } else if (available) {
                              e.currentTarget.style.background = "rgba(128,128,128,0.35)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!clickable || isSelected) return;
                            if (booked) {
                              if (slotAppointment?.userId === currentUser?.id) {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                              } else {
                                e.currentTarget.style.background = "rgba(25, 50, 85, 0.92)";
                              }
                            } else if (available) {
                              e.currentTarget.style.background = "rgba(128,128,128,0.2)";
                            } else if (timeOffData) {
                              e.currentTarget.style.background = "repeating-linear-gradient(-45deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.1) 6px, rgba(59, 130, 246, 0.18) 6px, rgba(59, 130, 246, 0.18) 12px)";
                            }
                          }}
                        >
                          {booked && slotAppointment ? (
                            <span
                              style={{
                                fontSize: "clamp(0.5rem, 1.8vw, 0.7rem)",
                                lineHeight: 1.3,
                                color: slotAppointment?.userId === currentUser?.id ? "#3b82f6" : "#d4af37",
                                textTransform: "uppercase",
                              }}
                            >
                              {slotAppointment.userId !== currentUser?.id ? (
                                <span style={{ fontWeight: 700, display: "block", marginBottom: "2px", fontSize: "clamp(0.45rem, 1.6vw, 0.7rem)" }}>REZERVISANO</span>
                              ) : null}

                              {(!availabilityByDate || slotAppointment.userId === currentUser?.id) && (
                                <>
                                  {slotAppointment.isPause ? (
                                    <span style={{
                                      display: "block",
                                      fontWeight: 800,
                                      fontSize: "0.75rem",
                                      color: "#d4af37"
                                    }}>
                                      PAUZA
                                    </span>
                                  ) : (
                                    <>
                                      {slotAppointment.service?.title != null && (
                                        <span style={{
                                          display: "block",
                                          fontWeight: 800,
                                          fontSize: "0.7rem",
                                        }}>
                                          {slotAppointment.service.title}
                                        </span>
                                      )}
                                      {slotAppointment.user?.name && (
                                        <span style={{ display: "block", opacity: 0.9 }}>
                                          {slotAppointment.user.name}
                                        </span>
                                      )}
                                      {slotAppointment.userId === currentUser?.id && availabilityByDate && (
                                        <span style={{
                                          marginTop: "4px",
                                          display: "inline-block",
                                          background: "#ef4444",
                                          color: "white",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          fontSize: "0.6rem",
                                          fontWeight: 800
                                        }}>OTKAŽI</span>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </span>
                          ) : selectionMode === "working_hours" && available ? (
                            <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                              POSTOJEĆI TERMIN
                            </span>
                          ) : clickable && selectionMode !== "time_off" && !timeOffReason ? (
                            <span style={{ fontWeight: 700 }}>
                              {format(
                                setMinutes(
                                  setHours(new Date(2000, 0, 1), hour),
                                  min,
                                ),
                                "HH:mm",
                              )}
                            </span>
                          ) : timeOffReason ? (
                            minutes === minMinutes ? (
                              <span style={{
                                fontSize: "0.7rem",
                                color: "#60a5fa",
                                fontWeight: 600,
                                textTransform: "uppercase"
                              }}>
                                {timeOffReason}
                              </span>
                            ) : null
                          ) : (
                            ""
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { getWeekStart, formatWeekSpan, DAY_NAMES, MONTH_NAMES };
