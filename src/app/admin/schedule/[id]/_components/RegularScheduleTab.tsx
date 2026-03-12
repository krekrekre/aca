"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSchedule } from "../../actions";
import { Plus, Trash2 } from "lucide-react";
import css from "./ScheduleForm.module.css";

const DAYS = [
    { label: "Ponedeljak", value: 1 },
    { label: "Utorak", value: 2 },
    { label: "Sreda", value: 3 },
    { label: "Četvrtak", value: 4 },
    { label: "Petak", value: 5 },
    { label: "Subota", value: 6 },
    { label: "Nedelja", value: 0 },
];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
}

export type RegularEntry = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

export default function RegularScheduleTab({
    employeeId,
    initialEntries,
}: {
    employeeId: string;
    initialEntries: RegularEntry[];
}) {
    const router = useRouter();
    const [schedule, setSchedule] = useState<Record<number, { startTime: string; endTime: string }[]>>({});
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState("");

    const entriesKey = JSON.stringify(initialEntries);
    useEffect(() => {
        const initial: Record<number, { startTime: string; endTime: string }[]> = {};
        DAYS.forEach(day => {
            initial[day.value] = initialEntries
                .filter(e => e.dayOfWeek === day.value)
                .map(e => ({ startTime: e.startTime, endTime: e.endTime }));
        });
        setSchedule(initial);
    }, [entriesKey, initialEntries]);

    const handleSave = async () => {
        setIsPending(true);
        setMessage("");

        const periods: RegularEntry[] = [];
        Object.entries(schedule).forEach(([dayStr, dayPeriods]) => {
            const dayOfWeek = parseInt(dayStr, 10);
            dayPeriods.forEach(p => {
                periods.push({
                    dayOfWeek,
                    startTime: p.startTime,
                    endTime: p.endTime
                });
            });
        });

        try {
            await updateSchedule(employeeId, periods);
            setMessage("Redovno radno vreme uspešno sačuvano.");
            setTimeout(() => setMessage(""), 3000);
            router.refresh();
        } catch (error) {
            setMessage("Greška pri čuvanju.");
        } finally {
            setIsPending(false);
        }
    };

    const toggleDay = (dayValue: number) => {
        setSchedule(prev => {
            const hasPeriods = prev[dayValue] && prev[dayValue].length > 0;
            return {
                ...prev,
                [dayValue]: hasPeriods ? [] : [{ startTime: "09:00", endTime: "17:00" }]
            };
        });
    };

    const updatePeriod = (dayValue: number, index: number, field: "startTime" | "endTime", value: string) => {
        setSchedule(prev => {
            const newPeriods = [...prev[dayValue]];
            newPeriods[index] = { ...newPeriods[index], [field]: value };
            return { ...prev, [dayValue]: newPeriods };
        });
    };

    const addPeriod = (dayValue: number) => {
        setSchedule(prev => ({
            ...prev,
            [dayValue]: [...(prev[dayValue] || []), { startTime: "09:00", endTime: "17:00" }]
        }));
    };

    const removePeriod = (dayValue: number, index: number) => {
        setSchedule(prev => {
            const newPeriods = [...prev[dayValue]];
            newPeriods.splice(index, 1);
            return { ...prev, [dayValue]: newPeriods };
        });
    };

    return (
        <div className={css.irregularCard} style={{ borderTop: "none", paddingTop: "0.5rem" }}>
            <h4 className={css.irregularListTitle} style={{ marginBottom: "1rem" }}>Redovno radno vreme</h4>
            
            <div className={css.dayList}>
                {DAYS.map(day => {
                    const periods = schedule[day.value] || [];
                    const isActive = periods.length > 0;

                    return (
                        <div key={day.value} className={css.dayCard}>
                            <div className={css.dayRow}>
                                <div className={css.dayLabel}>
                                    <button 
                                        type="button"
                                        className={css.toggle} 
                                        data-active={isActive}
                                        onClick={() => toggleDay(day.value)}
                                        aria-label={isActive ? "Isključi" : "Uključi"}
                                    >
                                        <div className={css.toggleKnob} />
                                    </button>
                                    <span className={css.dayName}>{day.label}</span>
                                </div>
                                
                                <div className={css.periodsAndAdd}>
                                    <div className={`${css.periods} ${!isActive ? css.disabled : ""}`}>
                                        {periods.map((p, idx) => (
                                            <div key={idx} className={css.periodRow}>
                                                <select 
                                                    className={css.timeSelect}
                                                    value={p.startTime}
                                                    onChange={(e) => updatePeriod(day.value, idx, "startTime", e.target.value)}
                                                    disabled={!isActive}
                                                >
                                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <span className={css.periodDash}>-</span>
                                                <select 
                                                    className={css.timeSelect}
                                                    value={p.endTime}
                                                    onChange={(e) => updatePeriod(day.value, idx, "endTime", e.target.value)}
                                                    disabled={!isActive}
                                                >
                                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <div className={css.actionSlot}>
                                                    <button 
                                                        type="button"
                                                        className={css.removePeriodBtn}
                                                        onClick={() => removePeriod(day.value, idx)}
                                                        disabled={!isActive}
                                                        title="Ukloni smenu"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        type="button"
                                        className={css.addPeriodCircleBtn}
                                        onClick={() => addPeriod(day.value)}
                                        disabled={!isActive}
                                        title="Dodaj smenu"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={css.irregularActions}>
                <button 
                    type="button"
                    className={css.irregularSaveBtn}
                    onClick={handleSave}
                    disabled={isPending}
                >
                    {isPending ? "Čuvanje..." : "Sačuvaj"}
                </button>
            </div>

            {message && (
                <p className={`${css.message} ${message.includes("uspešno") ? css.success : css.error}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
