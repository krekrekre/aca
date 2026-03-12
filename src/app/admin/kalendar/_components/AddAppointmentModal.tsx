"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { User, Service } from "@prisma/client";
import { format } from "date-fns";

const SR_DAYS = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
const SR_MONTHS_SHORT = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];
import { createAppointmentByAdmin } from "../actions";
import { X, Clock, Search, Ghost } from "lucide-react";
import styles from "./AddAppointmentModal.module.css";

type Props = {
    start: Date;
    end: Date;
    employeeId: string;
    users: User[];
    services: Service[];
    onClose: () => void;
    onSuccess: () => void;
};

export default function AddAppointmentModal({ start, end, employeeId, users, services, onClose, onSuccess }: Props) {
    const router = useRouter();
    const [userId, setUserId] = useState("");
    const [clientSearch, setClientSearch] = useState("");
    const [clientListOpen, setClientListOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
    const clientListRef = useRef<HTMLDivElement>(null);
    const clientInputWrapRef = useRef<HTMLDivElement>(null);

    const filteredUsers = useMemo(() => {
        const q = clientSearch.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                (u.email?.toLowerCase().includes(q)) ||
                (u.phone?.toLowerCase().includes(q))
        );
    }, [users, clientSearch]);

    const selectedUser = useMemo(() => users.find((u) => u.id === userId), [users, userId]);

    const [isPause, setIsPause] = useState(false);
    const regularServices = useMemo(() => {
        return services.filter(s => s.title.toUpperCase() !== "SLOBODAN TERMIN" && s.title.toUpperCase() !== "PAUZA");
    }, [services]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as HTMLElement;
            const inField = clientListRef.current?.contains(target);
            const inDropdown = target.closest("[data-client-dropdown]");
            if (!inField && !inDropdown) setClientListOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!clientListOpen || !clientInputWrapRef.current) {
            setDropdownRect(null);
            return;
        }
        function updateRect() {
            if (clientInputWrapRef.current) {
                const rect = clientInputWrapRef.current.getBoundingClientRect();
                setDropdownRect({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width,
                });
            }
        }
        updateRect();
        const obs = new ResizeObserver(updateRect);
        obs.observe(clientInputWrapRef.current);
        window.addEventListener("scroll", updateRect, true);
        return () => {
            obs.disconnect();
            window.removeEventListener("scroll", updateRect, true);
        };
    }, [clientListOpen]);

    const [serviceId, setServiceId] = useState(() => regularServices[0]?.id ?? "");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!isPause && !serviceId) {
            setError("Izaberite uslugu.");
            return;
        }
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
        setIsPending(true);
        try {
            await createAppointmentByAdmin({
                userId: userId || undefined,
                employeeId,
                serviceId: isPause ? null : serviceId,
                isPause,
                duration: durationMinutes,
                startTime: start.toISOString(),
            });
            router.refresh();
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.message || "Greška pri kreiranju termina.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.title}>Nova rezervacija</h2>
                        <button
                            type="button"
                            onClick={() => setIsPause(!isPause)}
                            className={`${styles.pauseButton} ${isPause ? styles.selected : ""}`}
                        >
                            <Ghost size={14} />
                            <span>PAUZA</span>
                        </button>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Zatvori">
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.body}>
                    <div className={styles.timePill}>
                        <Clock size={18} />
                        <span>
                            {SR_DAYS[start.getDay()]}, {start.getDate()}. {SR_MONTHS_SHORT[start.getMonth()]} · {format(start, "HH:mm")}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {isPause ? (
                            <div className={styles.pauseNotice}>
                                <Ghost size={24} />
                                <p>PAUZA će blokirati ovaj termin. Klijenti neće moći da zakažu u ovo vreme.</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className={styles.label}>Usluga</label>
                                    <div className={styles.serviceGrid}>
                                        {regularServices.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setServiceId(s.id)}
                                                className={`${styles.serviceCard} ${serviceId === s.id ? styles.selected : ""}`}
                                            >
                                                <span className={styles.serviceCardTitle}>{s.title}</span>
                                                <span className={styles.serviceCardDuration}>{s.duration} min</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div ref={clientListRef} className={styles.clientFieldWrap}>
                                    <label className={styles.label}>
                                        Klijent <span className={styles.labelOptional}>(opciono)</span>
                                    </label>
                                    <div ref={clientInputWrapRef} className={styles.clientSearchWrap}>
                                        <Search size={18} className={styles.clientSearchIcon} aria-hidden />
                                        <input
                                            type="text"
                                            value={selectedUser ? `${selectedUser.name}${selectedUser.email ? ` (${selectedUser.email})` : ""}` : clientSearch}
                                            onChange={(e) => {
                                                setClientSearch(e.target.value);
                                                if (userId) setUserId("");
                                                setClientListOpen(true);
                                            }}
                                            onFocus={() => setClientListOpen(true)}
                                            placeholder="Pretražite po imenu, emailu ili telefonu..."
                                            className={styles.clientInput}
                                            autoComplete="off"
                                        />
                                        {selectedUser && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUserId("");
                                                    setClientSearch("");
                                                    setClientListOpen(true);
                                                }}
                                                className={styles.clientClear}
                                                aria-label="Ukloni klijenta"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {clientListOpen &&
                                        dropdownRect &&
                                        typeof document !== "undefined" &&
                                        createPortal(
                                            <div
                                                data-client-dropdown
                                                className={styles.clientDropdownPortal}
                                                style={{
                                                    top: dropdownRect.top,
                                                    left: dropdownRect.left,
                                                    width: dropdownRect.width,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className={styles.clientOption}
                                                    onClick={() => {
                                                        setUserId("");
                                                        setClientSearch("");
                                                        setClientListOpen(false);
                                                    }}
                                                >
                                                    — Nije izabran —
                                                </button>
                                                {filteredUsers.length === 0 ? (
                                                    <div className={styles.clientOptionEmpty}>Nema rezultata</div>
                                                ) : (
                                                    filteredUsers.slice(0, 8).map((u) => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            className={styles.clientOption}
                                                            onClick={() => {
                                                                setUserId(u.id);
                                                                setClientSearch("");
                                                                setClientListOpen(false);
                                                            }}
                                                        >
                                                            <span className={styles.clientOptionName}>{u.name}</span>
                                                            {(u.email || u.phone) && (
                                                                <span className={styles.clientOptionMeta}>
                                                                    {[u.email, u.phone].filter(Boolean).join(" · ")}
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>,
                                            document.body
                                        )}
                                </div>
                            </>
                        )}

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.actions}>
                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.btnPrimary}`}
                                disabled={isPending}
                            >
                                {isPending ? "Čuvanje..." : "Kreiraj termin"}
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
