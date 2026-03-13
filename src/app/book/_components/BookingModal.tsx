"use client";

import { useBooking } from "./BookingContext";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Service } from "@prisma/client";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import { X, Clock, User as UserIcon, Calendar, Check, PlusCircle } from "lucide-react";
import styles from "./BookingModal.module.css";

interface Props {
    services: Service[];
}

export default function BookingModal({ services }: Props) {
    const { state, setTimeSlot, setService, toggleExtra, resetBooking } = useBooking();
    const router = useRouter();
    const { data: session } = useSession();
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerName, setRegisterName] = useState("");
    const [registerPhone, setRegisterPhone] = useState("");
    const [authError, setAuthError] = useState("");
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const isOpen = !!state.selectedTimeSlot || isSuccess;

    const aptDate = useMemo(() => {
        if (!state.selectedTimeSlot) return null;
        return new Date(state.selectedTimeSlot.time);
    }, [state.selectedTimeSlot]);

    const maxDuration = state.selectedTimeSlot?.maxDuration ?? 0;

    const currentTotalDuration = useMemo(() => {
        let d = state.selectedService?.duration ?? 0;
        state.selectedExtras.forEach(extraId => {
            const extra = state.selectedService?.extraServices?.find(e => e.id === extraId);
            if (extra) d += extra.duration;
        });
        return d;
    }, [state.selectedService, state.selectedExtras]);

    const currentTotalPrice = useMemo(() => {
        let p = state.selectedService?.price ?? 0;
        state.selectedExtras.forEach(extraId => {
            const extra = state.selectedService?.extraServices?.find(e => e.id === extraId);
            if (extra) p += extra.price;
        });
        return p;
    }, [state.selectedService, state.selectedExtras]);

    // Auto-select first available service if none selected
    useEffect(() => {
        if (isOpen && !state.selectedService && services.length > 0 && !isSuccess) {
            const firstFit = services.find(s => s.duration <= maxDuration);
            if (firstFit) {
                setService(firstFit);
            }
        }
    }, [isOpen, state.selectedService, services, maxDuration, setService, isSuccess]);

    const handleClose = () => {
        if (isSuccess) {
            resetBooking();
            setIsSuccess(false);
        } else {
            setTimeSlot(null);
            setService(null);
            setAuthMode(null);
            setLoginEmail("");
            setLoginPassword("");
            setRegisterName("");
            setRegisterPhone("");
        }
        setError("");
        setAuthError("");
    };

    const processBooking = async () => {
        setIsPending(true);
        setError("");

        try {
            const res = await fetch("/api/booking/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: state.selectedEmployee?.id,
                    serviceId: state.selectedService?.id,
                    startTime: state.selectedTimeSlot?.time,
                    extraServiceIds: Array.from(state.selectedExtras),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Greška pri zakazivanju.");
            }

            // Success
            setIsSuccess(true);
            setIsPending(false);
            router.refresh();

        } catch (err: any) {
            setError(err.message || "Došlo je do neočekivane greške.");
            setIsPending(false);
        }
    };

    const handleConfirm = async () => {
        if (!state.selectedService) {
            setError("Molimo izaberite uslugu.");
            return;
        }

        if (!session) {
            setAuthMode("login");
            return;
        }

        await processBooking();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        setAuthError("");

        const res = await signIn("credentials", {
            email: loginEmail,
            password: loginPassword,
            redirect: false,
        });

        if (res?.error) {
            setAuthError("Pogrešan email ili lozinka.");
            setIsAuthLoading(false);
        } else {
            setIsAuthLoading(false);
            setAuthMode(null);
            await processBooking();
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        setAuthError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: registerName,
                    email: loginEmail,
                    password: loginPassword,
                    phone: registerPhone,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Greška pri registraciji.");
            }

            // Auto-login after registration
            const loginRes = await signIn("credentials", {
                email: loginEmail,
                password: loginPassword,
                redirect: false,
            });

            if (loginRes?.error) {
                setAuthError("Nalog je kreiran, ali prijava nije uspela. Molimo pokušajte ručno.");
                setAuthMode("login");
                setIsAuthLoading(false);
            } else {
                setIsAuthLoading(false);
                setAuthMode(null);
                await processBooking();
            }
        } catch (err: any) {
            setAuthError(err.message || "Greška pri registraciji.");
            setIsAuthLoading(false);
        }
    };

    // Auto-close success modal after 2 seconds
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                handleClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {isSuccess ? (
                    <div className={styles.successView}>
                        <div className={styles.successIcon}>
                            <Check size={40} />
                        </div>
                        <h2 className={styles.successTitle}>Uspešno!</h2>
                        <p className={styles.successText}>
                            Vaš termin je uspešno zakažen. Detalje možete pogledati na Vašem profilu.
                        </p>
                        <button className={styles.successAction} onClick={handleClose}>
                            Zatvori
                        </button>
                    </div>
                ) : authMode ? (
                    <>
                        <header className={styles.header}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <h2 className={styles.title}>{authMode === "login" ? "Prijava" : "Registracija"}</h2>
                                <button onClick={() => setAuthMode(null)} style={{ fontSize: "0.85rem", textTransform: "uppercase", background: "transparent", color: "var(--text-secondary)", border: "none", cursor: "pointer", textDecoration: "underline" }}>Nazad</button>
                            </div>
                            <button className={styles.closeBtn} onClick={handleClose} aria-label="Zatvori">
                                <X size={20} />
                            </button>
                        </header>
                        <div className={styles.body}>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center" }}>
                                {authMode === "login" ? "Prijavite se kako biste potvrdili termin." : "Kreirajte nalog kako biste potvrdili termin."}
                            </p>
                            
                            {authError && <div className={styles.error} style={{ marginBottom: "1.5rem" }}>{authError}</div>}
                            
                            <form onSubmit={authMode === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {authMode === "register" && (
                                    <>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Ime i Prezime</label>
                                            <input
                                                type="text"
                                                value={registerName}
                                                onChange={(e) => setRegisterName(e.target.value)}
                                                required
                                                placeholder="Petar Petrović"
                                                style={{ width: "100%", padding: "0.80rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Broj Telefona (opciono)</label>
                                            <input
                                                type="tel"
                                                value={registerPhone}
                                                onChange={(e) => setRegisterPhone(e.target.value)}
                                                maxLength={10}
                                                style={{ width: "100%", padding: "0.80rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Email adresa</label>
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        placeholder="vas@email.com"
                                        style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
                                    />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Lozinka</label>
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
                                    />
                                </div>
                                <button type="submit" className={styles.confirmBtn} disabled={isAuthLoading}>
                                    {isAuthLoading ? "Obrada..." : authMode === "login" ? "Prijavi se i zakaži" : "Registruj se i zakaži"}
                                </button>
                            </form>
                            
                            <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                {authMode === "login" ? (
                                    <>
                                        Nemate nalog? <button onClick={() => {setAuthMode("register"); setAuthError("");}} style={{ background: "transparent", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: "inherit" }}>Registrujte se</button>
                                    </>
                                ) : (
                                    <>
                                        Već imate nalog? <button onClick={() => {setAuthMode("login"); setAuthError("");}} style={{ background: "transparent", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: "inherit" }}>Prijavite se</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <header className={styles.header}>
                            <h2 className={styles.title}>Kompletirajte rezervaciju</h2>
                            <button className={styles.closeBtn} onClick={handleClose} aria-label="Zatvori">
                                <X size={20} />
                            </button>
                        </header>

                        <div className={styles.body}>
                            <div className={styles.infoSection}>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoIcon}>
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.infoLabel}>Berber</span>
                                        <span className={styles.infoValue}>{state.selectedEmployee?.name}</span>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoIcon}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <span className={styles.infoLabel}>Datum i vreme</span>
                                        <span className={styles.infoValue}>
                                            {aptDate && format(aptDate, "EEEE, d. MMMM yyyy.", { locale: srLatn })} u {aptDate && format(aptDate, "HH:mm")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h3 className={styles.sectionTitle}>Izaberite uslugu</h3>
                            <div className={styles.serviceList}>
                                {services.map((service) => {
                                    const isSelected = state.selectedService?.id === service.id;
                                    const canFit = service.duration <= maxDuration;

                                    return (
                                        <button
                                            key={service.id}
                                            className={`${styles.serviceOption} ${isSelected ? styles.selected : ""} ${!canFit ? styles.disabled : ""}`}
                                            onClick={() => canFit && setService(service)}
                                            disabled={!canFit}
                                        >
                                            <div className={styles.serviceMain}>
                                                <span className={styles.serviceTitle}>{service.title}</span>
                                                <span className={styles.serviceMeta}>⏱ {service.duration} min</span>
                                            </div>
                                            <div className={styles.servicePrice}>
                                                {service.price.toFixed(0)} RSD
                                                {isSelected && <Check size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {state.selectedService && state.selectedService.extraServices && state.selectedService.extraServices.length > 0 && (
                                <>
                                    <h3 className={styles.sectionTitle} style={{ marginTop: "1.5rem" }}>Dodatne usluge</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {state.selectedService.extraServices.map((extra) => {
                                            const isSelected = state.selectedExtras.has(extra.id);
                                            const fitsWithExtra = (currentTotalDuration - (isSelected ? extra.duration : 0) + (isSelected ? 0 : extra.duration)) <= maxDuration;
                                            const canToggle = isSelected || fitsWithExtra;

                                            return (
                                                <button
                                                    key={extra.id}
                                                    onClick={() => canToggle && toggleExtra(extra.id)}
                                                    disabled={!canToggle}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "0.85rem 1rem",
                                                        borderRadius: "12px",
                                                        border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                                                        background: isSelected ? "rgba(224, 123, 57, 0.05)" : "transparent",
                                                        cursor: canToggle ? "pointer" : "not-allowed",
                                                        opacity: canToggle ? 1 : 0.5,
                                                        transition: "all 0.2s",
                                                        width: "100%",
                                                        textAlign: "left"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                        <div style={{ color: isSelected ? "var(--accent)" : "var(--text-secondary)" }}>
                                                            {isSelected ? <Check size={20} /> : <PlusCircle size={20} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: isSelected ? "var(--accent)" : "var(--text-primary)", fontSize: "0.95rem" }}>{extra.title}</div>
                                                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>+{extra.duration} min</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontWeight: 700, color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>
                                                        +{extra.price.toFixed(0)} RSD
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        <footer className={styles.footer} style={{ borderTop: "1px solid var(--border)", padding: "1.25rem 1.5rem", background: "var(--surface)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                    Ukupno trajanje: <strong>{currentTotalDuration} min</strong>
                                </div>
                                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)" }}>
                                    {currentTotalPrice.toFixed(0)} RSD
                                </div>
                            </div>
                            <button 
                                className={styles.confirmBtn} 
                                onClick={handleConfirm}
                                disabled={isPending || !state.selectedService}
                            >
                                {!session 
                                    ? "Prijavite se za potvrdu" 
                                    : isPending 
                                        ? "Čuvanje..." 
                                        : "Potvrdi termin"}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}
