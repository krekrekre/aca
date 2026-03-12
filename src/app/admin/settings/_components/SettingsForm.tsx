"use client";

import { updateSettings } from "../actions";
import { useState } from "react";
import { Settings } from "@prisma/client";

export default function SettingsForm({ settings }: { settings: Settings }) {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setMessage("");
        const formData = new FormData(e.currentTarget);
        try {
            await updateSettings(formData);
            setMessage("Podešavanja su uspešno ažurirana!");
        } catch (err) {
            setMessage("Ažuriranje podešavanja nije uspelo.");
        } finally {
            setIsPending(false);
            setTimeout(() => setMessage(""), 3000);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Maksimalan broj dana za unapred zakazivanje
                </label>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Koliko dana unapred korisnik može zakazati termin?
                </p>
                <input
                    name="maxBookingAdvanceDays"
                    required
                    type="number"
                    min="1"
                    max="365"
                    defaultValue={settings.maxBookingAdvanceDays}
                    style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", transition: "var(--transition)", outline: "none", fontSize: "0.95rem" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
                />
            </div>

            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Trajanje polja u kalendaru (minuti)
                </label>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Koliko minuta traje jedan vremenski slot u nedeljnom prikazu kalendara? (npr. 15, 30, 60)
                </p>
                <input
                    name="appointmentDuration"
                    required
                    type="number"
                    min="5"
                    max="120"
                    defaultValue={settings.appointmentDuration ?? 30}
                    style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", transition: "var(--transition)", outline: "none", fontSize: "0.95rem" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
                />
            </div>

            <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Broj dozvoljenih rezervacija za period od 30 dana
                </label>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Maksimalan broj rezervacija koje jedan korisnik može kreirati u poslednjih 30 dana.
                </p>
                <input
                    name="maxBookingsPerMonth"
                    required
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={settings.maxBookingsPerMonth}
                    style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", transition: "var(--transition)", outline: "none", fontSize: "0.95rem" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
                />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                    {isPending ? "Čuvanje..." : "Sačuvaj Podešavanja"}
                </button>
                {message && (
                    <span style={{ color: message.includes("uspeš") ? "#22c55e" : "#ef4444", fontSize: "0.9rem" }}>
                        {message}
                    </span>
                )}
            </div>
        </form>
    );
}
