"use client";

import { updateEmployee } from "../actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin.module.css";
import { User } from "@prisma/client";

export default function EditEmployeeForm({ employee }: { employee: User }) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [errorText, setErrorText] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setErrorText("");
        const formData = new FormData(e.currentTarget);
        try {
            const result = await updateEmployee(employee.id, formData);
            if (result?.error) {
                setErrorText(result.error);
            } else {
                router.push("/admin/employees");
                router.refresh();
                return;
            }
        } catch (err) {
            setErrorText("Ažuriranje nije uspelo.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className={styles.card} style={{ maxWidth: "600px" }}>
            {errorText && (
                <div
                    style={{
                        color: "#ef4444",
                        marginBottom: "1rem",
                        padding: "0.75rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #ef4444",
                    }}
                >
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
                        defaultValue={employee.name}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                            background: "var(--bg-color)",
                            color: "var(--text-primary)",
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Email Adresa</label>
                    <input
                        name="email"
                        required
                        type="email"
                        defaultValue={employee.email}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                            background: "var(--bg-color)",
                            color: "var(--text-primary)",
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Broj Telefona (Opciono)</label>
                    <input
                        name="phone"
                        type="tel"
                        defaultValue={employee.phone ?? ""}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                            background: "var(--bg-color)",
                            color: "var(--text-primary)",
                        }}
                    />
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                    <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
                        {isPending ? "Čuvanje..." : "Sačuvaj"}
                    </button>
                    <Link href="/admin/employees" className="btn btn-outline" style={{ textAlign: "center", flex: 1 }}>
                        Otkaži
                    </Link>
                </div>
            </form>
        </div>
    );
}
