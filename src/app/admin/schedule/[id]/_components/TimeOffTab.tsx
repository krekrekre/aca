"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createTimeOffBatch, deleteTimeOff } from "../../actions";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import css from "./ScheduleForm.module.css";
import adminCss from "../../../admin.module.css";

export type TimeOffEntry = {
    id: string;
    date: string;
    reason: string;
};

const PRESETS = [
    { value: "Godisnji", label: "Godišnji" },
    { value: "Bolovanje", label: "Bolovanje" },
    { value: "Praznik", label: "Praznik" },
    { value: "Slobodan dan", label: "Slobodan dan" }
];

const DAY_NAMES = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
const MONTH_NAMES = [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
];

function toYMD(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function getCalendarDays(year: number, month: number): { date: Date; currentMonth: boolean }[] {
    // Generate dates at noon UTC to avoid any local DST or timezone issues
    const first = new Date(Date.UTC(year, month, 1, 12, 0, 0));
    const startPad = (first.getUTCDay() + 6) % 7;
    const days: { date: Date; currentMonth: boolean }[] = [];

    // Start at noon UTC of the first padded day
    const current = new Date(first);
    current.setUTCDate(current.getUTCDate() - startPad);

    for (let i = 0; i < 42; i++) {
        const d = new Date(current);
        days.push({
            date: d,
            currentMonth: d.getUTCMonth() === month
        });
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
}

export default function TimeOffTab({
    employeeId,
    initialEntries,
    appointments = [],
}: {
    employeeId: string;
    initialEntries: TimeOffEntry[];
    appointments?: { id: string; startTime: string; endTime: string }[];
}) {
    const router = useRouter();
    const [entries, setEntries] = useState<TimeOffEntry[]>(initialEntries);
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState("");
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null);

    // Sync from server when initialEntries change
    const entriesKey = useMemo(() => initialEntries.map((e) => e.id).join(","), [initialEntries]);
    useEffect(() => {
        setEntries(initialEntries);
    }, [entriesKey, initialEntries]);

    const confirmDelete = async () => {
        if (!entryToDelete) return;
        setIsPending(true);
        try {
            await deleteTimeOff(employeeId, entryToDelete);
            setEntries(prev => prev.filter(e => e.id !== entryToDelete));
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

        // Check if there are appointments on this specific day
        const entryDay = entry.date.slice(0, 10); // YMD part

        const overlapping = appointments.filter(apt => {
            const aptDay = apt.startTime.slice(0, 10);
            return aptDay === entryDay;
        });

        if (overlapping.length > 0) {
            setDeleteBlockedReason("Ne možete obrisati ovaj neradni dan jer postoje zakazani termini za taj datum.");
            return;
        }

        setEntryToDelete(id);
    };

    return (
        <div className={css.irregularCard} style={{ borderTop: "none", paddingTop: "0.5rem" }}>
            {/* Saved list: all entries */}
            <div className={css.irregularList} style={{ marginTop: 0 }}>
                <h4 className={css.irregularListTitle} style={{ marginBottom: "1.25rem" }}>Sačuvani neradni dani</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {entries
                        .slice()
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((entry) => (
                            <div key={entry.id} className={css.irregularEntry}>
                                <span className={css.irregularEntryDates}>
                                    {entry.date.length >= 10
                                        ? new Date(entry.date + "T12:00:00Z").toLocaleDateString("sr-RS", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
                                        : new Date(entry.date).toLocaleDateString("sr-RS", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                                </span>
                                <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>
                                    {PRESETS.find(p => p.value === entry.reason)?.label || entry.reason}
                                </span>
                                <button
                                    type="button"
                                    className={css.irregularDeleteBtn}
                                    onClick={() => handleDeleteClick(entry.id)}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    {entries.length === 0 && <p className={css.irregularEmpty}>Nema unetih neradnih dana.</p>}
                </div>
            </div>

            {message && (
                <p className={`${css.message} ${message.includes("sačuvani") || message.includes("uklonjen") ? css.success : css.error}`} style={{ marginTop: "1rem" }}>
                    {message}
                </p>
            )}

            {/* Delete Confirmation Modal */}
            {entryToDelete && (
                <div className={adminCss.modalOverlay}>
                    <div className={adminCss.modalContent}>
                        <h3 className={adminCss.modalTitle}>Potvrda brisanja</h3>
                        <p className={adminCss.modalText}>Da li ste sigurni da želite da uklonite ovaj neradni dan?</p>
                        <div className={adminCss.modalActions}>
                            <button type="button" className={adminCss.modalCancelBtn} onClick={() => setEntryToDelete(null)}>Otkaži</button>
                            <button type="button" className={adminCss.modalConfirmBtn} onClick={confirmDelete}>Ukloni</button>
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
