"use client";

import { useBooking } from "./BookingContext";
import { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { User } from "@prisma/client";
import WeeklyCalendarTable, { getWeekStart } from "@/components/WeeklyCalendarTable";
import "@/app/admin/kalendar/_components/calendar.css";
import { X, AlertCircle } from "lucide-react";

export default function Step1Time({ 
    employees, 
    slotDurationMinutes = 30,
    maxBookingAdvanceDays = 30,
    schedules = [],
    irregularSchedules = [],
    currentUser
}: { 
    employees: User[]; 
    slotDurationMinutes?: number;
    maxBookingAdvanceDays?: number;
    schedules?: any[];
    irregularSchedules?: any[];
    currentUser?: { id?: string; role?: string };
}) {
    const { state, setEmployee, setTimeSlot, setStep } = useBooking();
    const [appointments, setAppointments] = useState<any[]>([]);

    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
    const [availability, setAvailability] = useState<Record<string, { time: string; maxDuration: number }[]>>({});
    const [timeOffDates, setTimeOffDates] = useState<{ date: string; reason: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelModalApt, setCancelModalApt] = useState<any>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");

    useEffect(() => {
        if (!state.selectedEmployee && employees.length > 0) {
            setEmployee(employees[0]);
        }
    }, [state.selectedEmployee, employees, setEmployee]);

    useEffect(() => {
        if (!state.selectedEmployee) return;
        let isMounted = true;
        fetch(`/api/booking/time-off?employeeId=${state.selectedEmployee.id}`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : { dates: [] }))
            .then((data) => {
                if (isMounted) setTimeOffDates(data.dates ?? []);
            })
            .catch(() => {
                if (isMounted) setTimeOffDates([]);
            });
        return () => {
            isMounted = false;
        };
    }, [state.selectedEmployee]);

    useEffect(() => {
        if (!state.selectedEmployee) return;

        let isMounted = true;
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

        async function fetchAvailability() {
            setIsLoading(true);
            try {
                const weekEnd = addDays(currentWeekStart, 6);
                
                // Format dates safely for the API
                const formatYMD = (date: Date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    return `${y}-${m}-${d}`;
                };

                const startDateStr = formatYMD(currentWeekStart);
                const endDateStr = formatYMD(weekEnd);

                // Execute both API calls in parallel (1 for appointments, 1 for all availability)
                const [aptRes, availRes] = await Promise.all([
                    fetch(`/api/booking/appointments?employeeId=${state.selectedEmployee?.id}&start=${currentWeekStart.toISOString()}`, { cache: 'no-store' }),
                    fetch(`/api/booking/availability?employeeId=${state.selectedEmployee?.id}&startDate=${startDateStr}&endDate=${endDateStr}&stepMinutes=${slotDurationMinutes}`, { cache: 'no-store' })
                ]);

                if (aptRes.ok) {
                   const aptData = await aptRes.json();
                   if (isMounted) setAppointments(aptData.appointments ?? []);
                }

                if (availRes.ok) {
                    const data = await availRes.json();
                    if (isMounted) setAvailability(data.availability ?? {});
                }
            } catch (err) {
                console.error("Failed to fetch slots", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchAvailability();

        return () => {
            isMounted = false;
        };
    }, [currentWeekStart, state.selectedEmployee, slotDurationMinutes]);

    const handlePrevWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() - 7);
        const todayWeekStart = getWeekStart(new Date());
        setCurrentWeekStart(d.getTime() >= todayWeekStart.getTime() ? d : todayWeekStart);
    };

    const handleNextWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + 7);
        setCurrentWeekStart(d);
    };

    const handleCancelApt = (apt: any) => {
        if (currentUser?.id !== apt.userId) return;
        setCancelModalApt(apt);
        setCancelError("");
    };

    const confirmCancelApt = async () => {
        if (!cancelModalApt) return;
        setIsCancelling(true);
        setCancelError("");

        try {
            const { cancelOwnAppointment } = await import("../actions");
            await cancelOwnAppointment(cancelModalApt.id);
            
            // Refetch appointments
            const aptRes = await fetch(`/api/booking/appointments?employeeId=${state.selectedEmployee?.id}&start=${currentWeekStart.toISOString()}`);
            if (aptRes.ok) {
               const aptData = await aptRes.json();
               setAppointments(aptData.appointments ?? []);
            }
            setCancelModalApt(null);
        } catch (err: any) {
            setCancelError(err.message || "Greška pri otkazivanju.");
        } finally {
            setIsCancelling(false);
        }
    };

    const todayWeekStart = getWeekStart(new Date());
    const isPrevDisabled = currentWeekStart.getTime() <= todayWeekStart.getTime();

    const maxAllowedBookingDate = addDays(new Date(), maxBookingAdvanceDays);
    const nextWeekStart = addDays(currentWeekStart, 7);
    const isNextDisabled = nextWeekStart.getTime() > maxAllowedBookingDate.getTime();

    const handleSlotSelect = (start: Date, end: Date, maxDuration?: number) => {
        setTimeSlot({ time: start.toISOString(), maxDuration: maxDuration ?? slotDurationMinutes });
    };

    const employeeButtons = (
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "nowrap", marginBottom: "1.5rem", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "0.25rem", background: "var(--bg-color)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border)", width: "fit-content", maxWidth: "100%" }}>
            {employees.map((emp) => {
                const isSelected = state.selectedEmployee?.id === emp.id;
                return (
                    <button
                        key={emp.id}
                        type="button"
                        onClick={() => setEmployee(emp)}
                        style={{
                            padding: "0.5rem 1.25rem",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            textTransform: "uppercase" as const,
                            cursor: "pointer",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            letterSpacing: "0.06em",
                            flexShrink: 0,
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
    );

    return (
        <div>
            {employees.length > 0 && <div className="filters">{employeeButtons}</div>}

            <div className="calendar-container">
                <div className="calendar-wrapper card">
                    {isLoading ? (
                        <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--text-secondary)" }}>
                            Učitavanje dostupnih termina...
                        </div>
                    ) : state.selectedEmployee ? (
                        <WeeklyCalendarTable
                            weekStart={currentWeekStart}
                            slotDurationMinutes={slotDurationMinutes}
                            employeeId={state.selectedEmployee.id}
                            schedules={schedules}
                            irregularSchedules={irregularSchedules}
                            timeOffs={timeOffDates.map((item) => ({
                                employeeId: state.selectedEmployee!.id,
                                date: item.date,
                                reason: item.reason,
                            }))}
                            appointments={appointments.map(a => ({
                                ...a,
                                startTime: new Date(a.startTime),
                                endTime: new Date(a.endTime),
                            }))}
                            currentUser={currentUser}
                            availabilityByDate={availability}
                            onSlotSelect={handleSlotSelect}
                            onAppointmentClick={handleCancelApt}
                            onPrevWeek={isPrevDisabled ? undefined : handlePrevWeek}
                            onNextWeek={isNextDisabled ? undefined : handleNextWeek}
                        />
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            Izaberite frizera da biste videli dostupne termine.
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Cancellation Modal */}
            {cancelModalApt && (
                <div 
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.8)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                        padding: "1rem"
                    }}
                    onClick={() => !isCancelling && setCancelModalApt(null)}
                >
                    <div 
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-xl)",
                            width: "100%",
                            maxWidth: "400px",
                            padding: "2rem",
                            textAlign: "center",
                            boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
                            animation: "modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "1.5rem" }} />
                        <h3 style={{ 
                            fontSize: "1.5rem", 
                            fontFamily: "var(--font-serif)",
                            color: "var(--text-primary)",
                            margin: "0 0 1rem 0"
                        }}>
                            Otkazivanje termina
                        </h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.5 }}>
                            Da li ste sigurni da želite da otkažete termin za <strong>{cancelModalApt.service?.title || 'izabranu uslugu'}</strong>? 
                            Ova radnja je nepovratna.
                        </p>
                        
                        {cancelError && (
                            <div style={{ 
                                padding: "0.75rem", 
                                background: "rgba(239, 68, 68, 0.1)", 
                                border: "1px solid #ef4444", 
                                color: "#ef4444", 
                                borderRadius: "8px", 
                                marginBottom: "1.5rem",
                                fontSize: "0.9rem"
                            }}>
                                {cancelError}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={() => setCancelModalApt(null)}
                                disabled={isCancelling}
                                style={{
                                    flex: 1,
                                    padding: "0.85rem",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-primary)",
                                    borderRadius: "var(--radius-md)",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                Nazad
                            </button>
                            <button
                                onClick={confirmCancelApt}
                                disabled={isCancelling}
                                style={{
                                    flex: 1,
                                    padding: "0.85rem",
                                    background: "#ef4444",
                                    border: "none",
                                    color: "white",
                                    borderRadius: "var(--radius-md)",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {isCancelling ? "Otkazivanje..." : "Otkaži"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes modalIn {
                    from { transform: scale(0.9) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
