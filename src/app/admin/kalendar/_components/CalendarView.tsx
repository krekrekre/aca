"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Appointment, Service, User, Schedule, TimeOff, IrregularSchedule } from "@prisma/client";
import { format } from "date-fns";
import WeeklyCalendarTable, { getWeekStart, type TimeOff as CalendarTimeOff } from "@/components/WeeklyCalendarTable";
import AddAppointmentModal from "./AddAppointmentModal";
import AddWorkingHoursModal from "./AddWorkingHoursModal";
import RegularScheduleModal from "./RegularScheduleModal";
import { useAdminHeaderSlot } from "@/app/admin/_components/AdminHeaderSlotContext";
import { cancelAppointment, createIrregularSchedulesBatch, createTimeOffBatch } from "../actions";
import { deleteTimeOff } from "../../schedule/actions";
import "./calendar.css";

type AppointmentForCancel = {
    id: string;
    user?: { name: string; phone?: string | null };
    service?: { title: string } | null;
    startTime: Date | string;
};

interface CalendarViewProps {
    appointments: (Appointment & { user: User; employee: User; service: Service | null })[];
    employees: User[];
    schedules: Schedule[];
    irregularSchedules: IrregularSchedule[];
    timeOffs: TimeOff[];
    users: User[];
    services: Service[];
    defaultFieldDurationMinutes?: number;
    currentUser?: { id: string; role: string };
}

export default function CalendarView({
    appointments,
    employees,
    schedules,
    irregularSchedules,
    timeOffs,
    users,
    services,
    defaultFieldDurationMinutes = 30,
    currentUser,
}: CalendarViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlEmployeeId = searchParams.get("employeeId");
 
    const firstEmployeeId = employees[0]?.id ?? "";
    const [selectedEmployee, setSelectedEmployee] = useState<string>(() => {
        if (urlEmployeeId && employees.some(e => e.id === urlEmployeeId)) {
            return urlEmployeeId;
        }
        return firstEmployeeId;
    });
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
    const [slotForModal, setSlotForModal] = useState<{ start: Date; end: Date } | null>(null);
    const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentForCancel | null>(null);
    const [timeOffToDelete, setTimeOffToDelete] = useState<CalendarTimeOff | null>(null);
    const [isDeletingTimeOff, setIsDeletingTimeOff] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectionMode, setSelectionMode] = useState<"none" | "working_hours" | "time_off">("none");
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [showReasonSelector, setShowReasonSelector] = useState(false);
    const [dayForWorkingHoursModal, setDayForWorkingHoursModal] = useState<Date | null>(null);
    const [showRegularScheduleModal, setShowRegularScheduleModal] = useState(false);

    const filteredAppointments = useMemo(
        () =>
            (appointments as any[])
                .filter((a) => a.employeeId === selectedEmployee)
                .map((a) => ({
                    id: a.id,
                    employeeId: a.employeeId,
                    startTime: a.startTime,
                    endTime: a.endTime,
                    status: a.status,
                    user: { name: a.user?.name ?? "—", phone: a.user?.phone ?? null },
                    service: { title: a.service?.title ?? (a.isPause ? "PAUZA" : "Usluga") },
                    isPause: a.isPause,
                })),
        [appointments, selectedEmployee]
    );

    const timeOffsNormalized = useMemo(
        () =>
            timeOffs.map((t) => ({
                ...t,
                date: typeof t.date === "string" ? new Date(t.date) : t.date,
            })),
        [timeOffs]
    );

    const handlePrevWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() - 7);
        setCurrentWeekStart(d);
    };

    const handleNextWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + 7);
        setCurrentWeekStart(d);
    };

    const { setContent: setHeaderSlotContent } = useAdminHeaderSlot() ?? { setContent: () => { } };

    const handleSave = async (reason: string = "Neradni dan") => {
        if (selectedSlots.size === 0) return;
        setIsSaving(true);
        try {
            if (selectionMode === "working_hours") {
                const byDate: Record<string, number[]> = {};
                selectedSlots.forEach((sid) => {
                    const [dateStr, minutesStr] = sid.split("|");
                    if (!byDate[dateStr]) byDate[dateStr] = [];
                    byDate[dateStr].push(parseInt(minutesStr));
                });

                const entries: { startDate: string; endDate: string; startTime: string; endTime: string }[] = [];
                Object.entries(byDate).forEach(([dateStr, minutes]) => {
                    minutes.sort((a, b) => a - b);
                    let rangeStart = minutes[0];
                    for (let i = 0; i < minutes.length; i++) {
                        const current = minutes[i];
                        const next = minutes[i + 1];
                        if (next !== current + defaultFieldDurationMinutes) {
                            const formatTime = (m: number) => {
                                const h = Math.floor(m / 60);
                                const min = m % 60;
                                return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
                            };
                            entries.push({
                                startDate: dateStr,
                                endDate: dateStr,
                                startTime: formatTime(rangeStart),
                                endTime: formatTime(current + defaultFieldDurationMinutes),
                            });
                            rangeStart = next;
                        }
                    }
                });

                await createIrregularSchedulesBatch(selectedEmployee, entries);
            } else if (selectionMode === "time_off") {
                await createTimeOffBatch(selectedEmployee, Array.from(selectedSlots), reason);
            }
            setSelectionMode("none");
            setSelectedSlots(new Set());
            setShowReasonSelector(false);
            router.refresh();
        } catch (err) {
            alert("Slanje nije uspelo.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelSelection = () => {
        setSelectionMode("none");
        setSelectedSlots(new Set());
    };

    useEffect(() => {
        // Auto-refresh the calendar every 15 seconds to catch new bookings/cancellations
        const interval = setInterval(() => {
            router.refresh();
        }, 15000);

        return () => clearInterval(interval);
    }, [router]);

    useEffect(() => {
        const handleToggleSlot = (slotId: string) => {
            setSelectedSlots((prev) => {
                const next = new Set(prev);
                if (next.has(slotId)) next.delete(slotId);
                else next.add(slotId);
                return next;
            });
        };

        const toolbarContent = (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                {selectionMode === "none" ? (
                    <>
                        <div className="header-employees-container" style={{ gap: "0.35rem", background: "var(--bg-color)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                            {employees.map((emp) => {
                                const isSelected = selectedEmployee === emp.id;
                                return (
                                    <button
                                        key={emp.id}
                                        type="button"
                                        onClick={() => setSelectedEmployee(emp.id)}
                                        style={{
                                            padding: "0.45rem 1.1rem",
                                            borderRadius: "8px",
                                            border: "none",
                                            fontSize: "0.82rem",
                                            fontWeight: 600,
                                            textTransform: "uppercase" as const,
                                            cursor: "pointer",
                                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                            letterSpacing: "0.06em",
                                            whiteSpace: "nowrap" as const,
                                            ...(isSelected
                                                ? {
                                                    background: "var(--accent)",
                                                    color: "#fff",
                                                    boxShadow: "0 2px 12px rgba(224, 123, 57, 0.45)",
                                                }
                                                : {
                                                    background: "transparent",
                                                    color: "var(--text-secondary)",
                                                }),
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = "var(--surface-hover)";
                                                e.currentTarget.style.color = "var(--text-primary)";
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "var(--text-secondary)";
                                            }
                                        }}
                                    >
                                        {emp.name}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="header-actions-container" style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
                            <button
                                type="button"
                                className="header-action-btn"
                                style={{ 
                                    fontSize: "0.85rem", 
                                    padding: "0.6rem 1.25rem",
                                    background: "rgba(34, 197, 94, 0.1)",
                                    color: "#22c55e",
                                    border: "1px solid rgba(34, 197, 94, 0.3)",
                                    borderRadius: "var(--radius-md)",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase" as const,
                                    transition: "all 0.2s",
                                }}
                                onClick={() => setShowRegularScheduleModal(true)}
                                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(34, 197, 94, 0.2)"; e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.6)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(34, 197, 94, 0.1)"; e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.3)"; }}
                            >
                                <span className="desktop-only">Redovno radno vreme</span>
                                <span className="mobile-only">redovno</span>
                            </button>
                            <button
                                type="button"
                                className="header-action-btn"
                                style={{ 
                                    fontSize: "0.85rem", 
                                    padding: "0.6rem 1.25rem",
                                    background: "rgba(212, 175, 55, 0.1)",
                                    color: "#d4af37",
                                    border: "1px solid rgba(212, 175, 55, 0.3)",
                                    borderRadius: "var(--radius-md)",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase" as const,
                                    transition: "all 0.2s",
                                }}
                                onClick={() => setSelectionMode("working_hours")}
                                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)"; e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.6)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(212, 175, 55, 0.1)"; e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)"; }}
                            >
                                <span className="desktop-only">+ Dodaj Termin</span>
                                <span className="mobile-only">+ termin</span>
                            </button>
                            <button
                                type="button"
                                className="header-action-btn"
                                style={{ 
                                    fontSize: "0.85rem", 
                                    padding: "0.6rem 1.25rem",
                                    background: "rgba(59, 130, 246, 0.1)",
                                    color: "#60a5fa",
                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                    borderRadius: "var(--radius-md)",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase" as const,
                                    transition: "all 0.2s",
                                }}
                                onClick={() => setSelectionMode("time_off")}
                                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"; e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"; e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)"; }}
                            >
                                <span className="desktop-only">Neradni Dani</span>
                                <span className="mobile-only">neradni</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="header-selection-container" style={{ display: "flex", gap: "0.5rem", alignItems: "center", width: "100%", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, color: "var(--accent)" }}>
                            {selectionMode === "working_hours" ? "IZBOR RADNOG VREMENA" : "IZBOR NERADNIH DANA"}
                            {selectedSlots.size > 0 && ` (${selectedSlots.size})`}
                        </span>
                        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={handleCancelSelection}
                                style={{ 
                                    padding: "0.6rem 1.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    background: "transparent",
                                    color: "var(--text-secondary)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    cursor: "pointer",
                                    transition: "var(--transition)"
                                }}
                                onMouseOver={(e) => !isSaving && (e.currentTarget.style.borderColor = "var(--text-primary)")}
                                onMouseOut={(e) => !isSaving && (e.currentTarget.style.borderColor = "var(--border)")}
                            >
                                OTKAŽI
                            </button>
                            <button
                                type="button"
                                disabled={isSaving || selectedSlots.size === 0}
                                onClick={() => {
                                    if (selectionMode === "time_off") {
                                        setShowReasonSelector(true);
                                    } else {
                                        handleSave();
                                    }
                                }}
                                style={{ 
                                    padding: "0.6rem 1.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    background: "#22c55e", // Green
                                    color: "white",
                                    border: "none",
                                    borderRadius: "var(--radius-md)",
                                    cursor: selectedSlots.size === 0 || isSaving ? "not-allowed" : "pointer",
                                    opacity: selectedSlots.size === 0 || isSaving ? 0.6 : 1,
                                    transition: "var(--transition)",
                                    boxShadow: selectedSlots.size > 0 ? "0 2px 4px rgba(34, 197, 94, 0.2)" : "none"
                                }}
                                onMouseOver={(e) => !isSaving && selectedSlots.size > 0 && (e.currentTarget.style.transform = "translateY(-1px)")}
                                onMouseOut={(e) => !isSaving && selectedSlots.size > 0 && (e.currentTarget.style.transform = "translateY(0)")}
                            >
                                {isSaving ? "ŠALJEM..." : "SAČUVAJ IZMENE"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );

        setHeaderSlotContent(toolbarContent);
        return () => setHeaderSlotContent(null);
    }, [employees, selectedEmployee, setHeaderSlotContent, selectionMode, selectedSlots, isSaving, defaultFieldDurationMinutes, router]);

    /* Build the same toolbar inline for mobile (rendered below, hidden on desktop via CSS) */
    const mobileToolbar = (
        <div className="mobile-toolbar">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
                {selectionMode === "none" ? (
                    <>
                        {/* Employee buttons - kept in mobile toolbar below header */}
                        <div style={{ display: "flex", gap: "0.25rem", overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", background: "var(--bg-color)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                            {employees.map((emp) => {
                                const isSelected = selectedEmployee === emp.id;
                                return (
                                    <button
                                        key={emp.id}
                                        type="button"
                                        onClick={() => setSelectedEmployee(emp.id)}
                                        style={{
                                            padding: "0.4rem 0.9rem",
                                            borderRadius: "7px",
                                            border: "none",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            textTransform: "uppercase" as const,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            letterSpacing: "0.06em",
                                            flexShrink: 0,
                                            whiteSpace: "nowrap" as const,
                                            ...(isSelected
                                                ? {
                                                    background: "var(--accent)",
                                                    color: "#fff",
                                                    boxShadow: "0 2px 8px rgba(224, 123, 57, 0.4)",
                                                }
                                                : { background: "transparent", color: "var(--text-secondary)" }),
                                        }}
                                    >
                                        {emp.name}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <span style={{ fontWeight: 600, color: "var(--accent)", fontSize: "0.85rem", width: "100%", marginBottom: "0.25rem" }}>
                            {selectionMode === "working_hours" ? "IZBOR RADNOG VREMENA" : "IZBOR NERADNIH DANA"}
                            {selectedSlots.size > 0 && ` (${selectedSlots.size})`}
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={handleCancelSelection}
                                style={{ 
                                    flex: 1,
                                    padding: "0.55rem 0.75rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    background: "transparent",
                                    color: "var(--text-secondary)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    cursor: "pointer",
                                }}
                            >
                                OTKAŽI
                            </button>
                            <button
                                type="button"
                                disabled={isSaving || selectedSlots.size === 0}
                                onClick={() => {
                                    if (selectionMode === "time_off") {
                                        setShowReasonSelector(true);
                                    } else {
                                        handleSave();
                                    }
                                }}
                                style={{ 
                                    flex: 1,
                                    padding: "0.55rem 0.75rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    background: "#22c55e",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "var(--radius-md)",
                                    cursor: selectedSlots.size === 0 || isSaving ? "not-allowed" : "pointer",
                                    opacity: selectedSlots.size === 0 || isSaving ? 0.6 : 1,
                                }}
                            >
                                {isSaving ? "ŠALJEM..." : "SAČUVAJ"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="calendar-container">
            {mobileToolbar}
            <div className="calendar-wrapper card">
                <WeeklyCalendarTable
                    weekStart={currentWeekStart}
                    slotDurationMinutes={defaultFieldDurationMinutes}
                    employeeId={selectedEmployee}
                    schedules={schedules}
                    irregularSchedules={irregularSchedules}
                    timeOffs={timeOffsNormalized}
                    appointments={filteredAppointments}
                    currentUser={currentUser}
                    onSlotSelect={(start, end) => setSlotForModal({ start, end })}
                    onAppointmentClick={(apt) => setAppointmentToCancel({ id: apt.id, user: apt.user, service: apt.service, startTime: apt.startTime })}
                    onTimeOffClick={(to) => setTimeOffToDelete(to)}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    selectionMode={selectionMode}
                    selectedSlots={selectedSlots}
                    onSlotToggle={(slotId) => setSelectedSlots(prev => {
                        const next = new Set(prev);
                        if (next.has(slotId)) next.delete(slotId);
                        else next.add(slotId);
                        return next;
                    })}
                    onDayClick={(date) => setDayForWorkingHoursModal(date)}
                />
            </div>

            {slotForModal && (
                <AddAppointmentModal
                    start={slotForModal.start}
                    end={slotForModal.end}
                    employeeId={selectedEmployee}
                    users={users}
                    services={services}
                    onClose={() => setSlotForModal(null)}
                    onSuccess={() => setSlotForModal(null)}
                />
            )}

            {dayForWorkingHoursModal && (
                <AddWorkingHoursModal
                    date={dayForWorkingHoursModal}
                    employeeId={selectedEmployee}
                    slotDurationMinutes={defaultFieldDurationMinutes}
                    onClose={() => setDayForWorkingHoursModal(null)}
                    onSave={(slots) => {
                        setSelectedSlots(prev => {
                            const next = new Set(prev);
                            slots.forEach(s => next.add(s));
                            return next;
                        });
                        setDayForWorkingHoursModal(null);
                    }}
                />
            )}

            {showRegularScheduleModal && (
                <RegularScheduleModal
                    employeeId={selectedEmployee}
                    employeeName={employees.find(e => e.id === selectedEmployee)?.name ?? ""}
                    initialEntries={schedules.filter(s => s.employeeId === selectedEmployee).map(s => ({
                        dayOfWeek: s.dayOfWeek,
                        startTime: s.startTime,
                        endTime: s.endTime
                    }))}
                    onClose={() => setShowRegularScheduleModal(false)}
                    onSuccess={() => {
                        setShowRegularScheduleModal(false);
                        router.refresh();
                    }}
                />
            )}

            {appointmentToCancel && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => !isCancelling && setAppointmentToCancel(null)}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: "400px",
                            width: "90%",
                            padding: "1.5rem",
                            background: "var(--surface)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem" }}>Otkazati zakazivanje?</h3>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            {appointmentToCancel.user?.name ?? "—"}
                            {appointmentToCancel.service?.title && ` · ${appointmentToCancel.service.title}`}
                            {" · "}
                            {format(typeof appointmentToCancel.startTime === "string" ? new Date(appointmentToCancel.startTime) : appointmentToCancel.startTime, "dd.MM.yyyy HH:mm")}
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={isCancelling}
                                onClick={() => setAppointmentToCancel(null)}
                            >
                                Ne
                            </button>
                            <button
                                type="button"
                                className="btn"
                                disabled={isCancelling}
                                style={{ background: "#dc2626", color: "#fff", border: "none" }}
                                onClick={async () => {
                                    setIsCancelling(true);
                                    try {
                                        await cancelAppointment(appointmentToCancel.id);
                                        setAppointmentToCancel(null);
                                        router.refresh();
                                    } catch (err) {
                                        alert("Otkazivanje nije uspelo.");
                                    } finally {
                                        setIsCancelling(false);
                                    }
                                }}
                            >
                                {isCancelling ? "..." : "Da, otkaži"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {timeOffToDelete && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => !isDeletingTimeOff && setTimeOffToDelete(null)}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: "400px",
                            width: "90%",
                            padding: "1.5rem",
                            background: "var(--surface)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem" }}>Ukloniti neradni dan?</h3>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            {timeOffToDelete.reason || "Neradni dan"}
                            {" · "}
                            {format(typeof timeOffToDelete.date === "string" ? new Date(timeOffToDelete.date) : timeOffToDelete.date, "dd.MM.yyyy")}
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                disabled={isDeletingTimeOff}
                                onClick={() => setTimeOffToDelete(null)}
                            >
                                Odustani
                            </button>
                            <button
                                type="button"
                                className="btn"
                                disabled={isDeletingTimeOff || !timeOffToDelete.id}
                                style={{ background: "#dc2626", color: "#fff", border: "none" }}
                                onClick={async () => {
                                    if (!timeOffToDelete.id) return;
                                    setIsDeletingTimeOff(true);
                                    try {
                                        await deleteTimeOff(selectedEmployee, timeOffToDelete.id);
                                        setTimeOffToDelete(null);
                                        router.refresh();
                                    } catch (err) {
                                        alert("Uklanjanje nije uspelo.");
                                    } finally {
                                        setIsDeletingTimeOff(false);
                                    }
                                }}
                            >
                                {isDeletingTimeOff ? "..." : "Ukloni"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showReasonSelector && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1100,
                    }}
                    onClick={() => !isSaving && setShowReasonSelector(false)}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: "400px",
                            width: "90%",
                            padding: "1.5rem",
                            background: "var(--surface)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 1rem", fontSize: "1.2rem", color: "var(--text-primary)" }}>Vrsta neradnog dana</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {["Godišnji", "Bolovanje", "Praznik", "Slobodan dan"].map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => handleSave(reason)}
                                    disabled={isSaving}
                                    style={{
                                        padding: "0.75rem",
                                        textAlign: "left",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-sm)",
                                        color: "var(--text-primary)",
                                        fontSize: "0.95rem",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                                    onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: "right" }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setShowReasonSelector(false)}
                                style={{ padding: "0.5rem 1rem" }}
                            >
                                Odustani
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
