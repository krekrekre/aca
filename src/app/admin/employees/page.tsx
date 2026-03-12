import prisma from "@/lib/prisma";
import Link from "next/link";
import styles from "../admin.module.css";
import DeleteEmployeeButton from "./_components/DeleteEmployeeButton";
import { User, Mail, Phone, Calendar, Pencil } from "lucide-react";

export default async function EmployeesPage() {
    const employees = await prisma.user.findMany({
        where: { role: "EMPLOYEE" },
        orderBy: { createdAt: "asc" },
    });

    return (
        <div>
            <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className={styles.pageTitle}>Zaposleni</h1>
                    <p className={styles.pageDescription}>Upravljajte frizerima i ostalim članovima osoblja.</p>
                </div>
                <Link href="/admin/employees/new" className="btn btn-primary">
                    Dodaj Zaposlenog
                </Link>
            </div>

            {employees.length === 0 ? (
                <div
                    className={styles.card}
                    style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}
                >
                    Nema pronađenih zaposlenih.
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: "1.5rem" }}>
                    {employees.map((employee) => (
                        <div
                            key={employee.id}
                            className={styles.card}
                            style={{
                                padding: "2rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "1.25rem",
                                position: "relative",
                            }}
                        >
                            <Link
                                href={`/admin/employees/${employee.id}`}
                                className={styles.cardIconBtn}
                                style={{
                                    position: "absolute",
                                    top: "1.25rem",
                                    right: "1.25rem",
                                    padding: "0.5rem",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--text-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                title="Izmeni"
                                aria-label="Izmeni"
                            >
                                <Pencil size={20} />
                            </Link>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
                                <div
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: "50%",
                                        background: "rgba(211, 140, 65, 0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        color: "var(--accent)",
                                    }}
                                >
                                    <User size={32} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1, paddingRight: "1.5rem", marginTop: "0.25rem" }}>
                                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                        {employee.name}
                                    </h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                                        <Mail size={16} />
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{employee.email}</span>
                                    </div>
                                    {employee.phone && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.35rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                                            <Phone size={14} />
                                            <span>{employee.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
                                <Link
                                    href={`/admin/kalendar?employeeId=${employee.id}`}
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: "0.65rem 1rem", textAlign: "center", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                                >
                                    <Calendar size={18} />
                                    Kalendar
                                </Link>
                                <DeleteEmployeeButton id={employee.id} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
