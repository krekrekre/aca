"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createIrregularSchedule, deleteIrregularSchedule } from "../../actions";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import css from "./ScheduleForm.module.css";
import adminCss from "../../../admin.module.css";

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
}

const DAY_NAMES = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
const MONTH_NAMES = [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
];

export type IrregularEntry = {
    id: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
};

/** YYYY-MM-DD in local timezone (for calendar day keys) */
function toYMD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Normalize to YYYY-MM-DD (handles full ISO strings from server) */
function toDateOnly(s: string): string {
    return s.slice(0, 10);
}

/** Format YYYY-MM-DD using UTC date values (avoids timezone shifts) */
function formatDateLocal(ymd: string): string {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toLocaleDateString("sr-RS", { 
        day: "numeric", 
        month: "short", 
        year: "numeric",
        timeZone: "UTC"
    });
}

function formatDateRange(start: string, end: string): string {
    const sd = toDateOnly(start);
    const ed = toDateOnly(end);
    if (sd === ed) return formatDateLocal(sd);
    return `${formatDateLocal(sd)} – ${formatDateLocal(ed)}`;
}

function getCalendarDays(year: number, month: number): { date: Date; currentMonth: boolean }[] {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = (first.getDay() + 6) % 7;
    const days: { date: Date; currentMonth: boolean }[] = [];
    const padStart = new Date(first);
    padStart.setDate(padStart.getDate() - startPad);
    for (let i = 0; i < startPad; i++) {
        const d = new Date(padStart);
        d.setDate(d.getDate() + i);
        days.push({ date: d, currentMonth: false });
    }
    for (let d = 1; d <= last.getDate(); d++) {
        days.push({ date: new Date(year, month, d), currentMonth: true });
    }
    const remaining = 42 - days.length;
    const nextMonth = new Date(year, month + 1, 1);
    for (let i = 0; i < remaining; i++) {
        const d = new Date(nextMonth);
        d.setDate(d.getDate() + i);
        days.push({ date: d, currentMonth: false });
    }
    return days;
}

export default function IrregularScheduleTab({
    employeeId,
    initialEntries,
    appointments = [],
}: {
    employeeId: string;
    initialEntries: IrregularEntry[];
    appointments?: { id: string; startTime: string; endTime: string }[];
}) {
    const router = useRouter();
    const [entries, setEntries] = useState<IrregularEntry[]>(initialEntries);
    const [message, setMessage] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null);

    const entriesKey = initialEntries.map((e) => e.id).join(",");
    useEffect(() => {
        setEntries(initialEntries);
    }, [entriesKey, initialEntries]);

    const confirmDelete = async () => {
        if (!entryToDelete) return;
        setIsPending(true);
        setMessage("");
        try {
            await deleteIrregularSchedule(employeeId, entryToDelete);
            setEntries((prev) => prev.filter((e) => e.id !== entryToDelete));
            setMessage("Unos uklonjen.");
            setTimeout(() => setMessage(""), 3000);
            router.refresh();
        } catch {
            setMessage("Uklanjanje nije uspelo.");
        } finally {
            setIsPending(false);
            setEntryToDelete(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;

        // Check if there are appointments within this entry's duration
        const entryStart = new Date(`${entry.startDate}T${entry.startTime}:00Z`).getTime();
        const entryEnd = new Date(`${entry.endDate}T${entry.endTime}:00Z`).getTime();

        const overlapping = appointments.filter(apt => {
            const aptStart = new Date(apt.startTime).getTime();
            const aptEnd = new Date(apt.endTime).getTime();
            return aptStart < entryEnd && aptEnd > entryStart;
        });

        if (overlapping.length > 0) {
            setDeleteBlockedReason("Ne možete obrisati ovaj unos jer postoje zakazani termini u tom periodu.");
            return;
        }

        setEntryToDelete(id);
    };

    return (
        <div className={css.irregularCard} style={{ borderTop: "none", paddingTop: "0.5rem" }}>
            {/* List of saved entries */}
            <div className={css.irregularList} style={{ marginTop: 0 }}>
                <h4 className={css.irregularListTitle} style={{ marginBottom: "1rem" }}>Sačuvani unosi</h4>
                {entries.length === 0 ? (
                    <p className={css.irregularEmpty}>Nema unosa za nepravilno radno vreme.</p>
                ) : (
                    <ul className={css.irregularEntries}>
                        {entries.map((entry) => (
                            <li key={entry.id} className={css.irregularEntry}>
                                <span className={css.irregularEntryDates}>
                                    {formatDateRange(entry.startDate, entry.endDate)}
                                </span>
                                <span className={css.irregularEntryTimes}>
                                    {entry.startTime} – {entry.endTime}
                                </span>
                                <button
                                    type="button"
                                    className={css.irregularDeleteBtn}
                                    onClick={() => handleDeleteClick(entry.id)}
                                    disabled={isPending}
                                    aria-label="Ukloni"
                                    title="Ukloni unos"
                                >
                                    <X size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {message && (
                <p
                    className={`${css.message} ${
                        message.includes("sačuvano") || message.includes("uklonjen") ? css.success : css.error
                    }`}
                >
                    {message}
                </p>
            )}

            {/* Custom confirmation popup */}
            {entryToDelete && (
                <div className={adminCss.modalOverlay}>
                    <div className={adminCss.modalContent}>
                        <h3 className={adminCss.modalTitle}>Potvrda brisanja</h3>
                        <p className={adminCss.modalText}>Da li ste sigurni da želite da uklonite ovaj unos?</p>
                        <div className={adminCss.modalActions}>
                            <button
                                type="button"
                                className={adminCss.modalCancelBtn}
                                onClick={() => setEntryToDelete(null)}
                                disabled={isPending}
                            >
                                Otkaži
                            </button>
                            <button
                                type="button"
                                className={adminCss.modalConfirmBtn}
                                onClick={confirmDelete}
                                disabled={isPending}
                            >
                                {isPending ? "Brisanje..." : "Ukloni"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Blocked action popup */}
            {deleteBlockedReason && (
                <div className={adminCss.modalOverlay}>
                    <div className={adminCss.modalContent}>
                        <h3 className={adminCss.modalTitle} style={{ color: "var(--accent)" }}>Akcija otkazana</h3>
                        <p className={adminCss.modalText}>{deleteBlockedReason}</p>
                        <div className={adminCss.modalActions}>
                            <button
                                type="button"
                                className={adminCss.btnPrimary}
                                onClick={() => setDeleteBlockedReason(null)}
                                style={{ width: "100%", padding: "0.75rem" }}
                            >
                                U redu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
