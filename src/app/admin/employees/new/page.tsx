"use client";

import { createEmployee } from "../actions";
import { useState } from "react";
import Link from "next/link";
import styles from "../../admin.module.css";

export default function NewEmployeePage() {
    const [isPending, setIsPending] = useState(false);
    const [errorText, setErrorText] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setErrorText("");
        const formData = new FormData(e.currentTarget);
        try {
            await createEmployee(formData);
        } catch (err: any) {
            setErrorText(err.message || "Kreiranje zaposlenog nije uspelo");
            setIsPending(false);
        }
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dodaj Novog Zaposlenog</h1>
                <p className={styles.pageDescription}>Kreirajte profil za novog frizera/člana osoblja.</p>
            </div>

            <div className={styles.card} style={{ maxWidth: "600px" }}>
                {errorText && (
                    <div style={{ color: "#ef4444", marginBottom: "1rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid #ef4444" }}>
                        {errorText}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Puno Ime</label>
                        <input
                            name="name"
                            required
                            type="text"
                            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", transition: "var(--transition)", outline: "none", fontSize: "0.95rem" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Email Adresa</label>
                        <input
                            name="email"
                            required
                            type="email"
                            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", transition: "var(--transition)", outline: "none", fontSize: "0.95rem" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>Broj Telefona (Opciono)</label>
                        <input
                            name="phone"
                            type="tel"
                            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", transition: "var(--transition)", outline: "none", fontSize: "0.95rem" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
                            {isPending ? "Čuvanje..." : "Kreiraj Zaposlenog"}
                        </button>
                        <Link href="/admin/employees" className="btn btn-outline" style={{ textAlign: "center", flex: 1 }}>
                            Otkaži
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
