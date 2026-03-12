"use client";

import { useState } from "react";
import { X, Plus, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import styles from "./AddAppointmentModal.module.css";
import { createIrregularSchedulesBatch } from "../actions";

interface TimeSpan {
    startTime: string;
    endTime: string;
}

interface Props {
    date: Date;
    employeeId: string;
    slotDurationMinutes: number;
    onClose: () => void;
    onSave: (slots: string[]) => void;
}

const TIME_PRESETS = Array.from({ length: 15 }, (_, i) => {
    const h = String(i + 9).padStart(2, "0");
    return `${h}:00`;
});

export default function AddWorkingHoursModal({ date, employeeId, slotDurationMinutes, onClose, onSave }: Props) {
    const [spans, setSpans] = useState<TimeSpan[]>([{ startTime: "09:00", endTime: "17:00" }]);
    const [error, setError] = useState("");

    const addSpan = () => setSpans([...spans, { startTime: "09:00", endTime: "17:00" }]);
    const removeSpan = (index: number) => setSpans(spans.filter((_, i) => i !== index));
    const updateSpan = (index: number, field: keyof TimeSpan, value: string) => {
        const next = [...spans];
        next[index] = { ...next[index], [field]: value };
        setSpans(next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const dateStr = format(date, "yyyy-MM-dd");
        const allSlots: string[] = [];

        for (const span of spans) {
            const [sh, sm] = span.startTime.split(":").map(Number);
            const [eh, em] = span.endTime.split(":").map(Number);
            let currentMinutes = sh * 60 + sm;
            const endMinutes = eh * 60 + em;

            if (currentMinutes >= endMinutes) {
                setError("Krajnje vreme mora biti nakon početnog.");
                return;
            }

            while (currentMinutes < endMinutes) {
                allSlots.push(`${dateStr}|${currentMinutes}`);
                currentMinutes += slotDurationMinutes;
            }
        }

        onSave(allSlots);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2 className={styles.title}>Radno vreme</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.body}>
                    <div className={styles.timePill}>
                        <Clock size={18} />
                        <span>{format(date, "EEEE, d. MMMM")}</span>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {spans.map((span, index) => (
                                <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                    <div style={{ flex: 1 }}>
                                        <select
                                            value={span.startTime}
                                            onChange={(e) => updateSpan(index, "startTime", e.target.value)}
                                            className={styles.select}
                                            required
                                        >
                                            {TIME_PRESETS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <span style={{ color: "var(--text-secondary)" }}>—</span>
                                    <div style={{ flex: 1 }}>
                                        <select
                                            value={span.endTime}
                                            onChange={(e) => updateSpan(index, "endTime", e.target.value)}
                                            className={styles.select}
                                            required
                                        >
                                            {TIME_PRESETS.map(t => <option key={t} value={t}>{t}</option>)}
                                            <option value="23:59">23:59</option>
                                        </select>
                                    </div>
                                    {spans.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSpan(index)}
                                            style={{
                                                background: "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                                border: "none",
                                                padding: "0.5rem",
                                                borderRadius: "var(--radius-sm)",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addSpan}
                            style={{
                                marginTop: "0.5rem",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px dashed var(--border)",
                                borderRadius: "var(--radius-md)",
                                padding: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        >
                            <Plus size={16} />
                            <span>Dodaj još jedan interval</span>
                        </button>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.actions} style={{ marginTop: "1rem" }}>
                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.btnPrimary}`}
                            >
                                Sačuvaj
                            </button>
                            <button type="button" className={`btn btn-outline ${styles.btnSecondary}`} onClick={onClose}>
                                Otkaži
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
