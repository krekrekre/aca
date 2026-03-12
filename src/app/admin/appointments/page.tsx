import prisma from "@/lib/prisma";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
    const appointments = await prisma.appointment.findMany({
        orderBy: { startTime: "asc" },
        include: {
            user: true,
            employee: true,
            service: true,
        },
    }) as any[];

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Sva Zakazivanja</h1>
                <p className={styles.pageDescription}>Pregledajte i upravljajte dolazećim zakazivanjima za sve zaposlene.</p>
            </div>

            <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", margin: 0 }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-light)", backgroundColor: "var(--bg-color)", fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                                <th style={{ padding: "1rem", fontWeight: 600 }}>Datum i Vreme</th>
                                <th style={{ padding: "1rem", fontWeight: 600 }}>Klijent</th>
                                <th style={{ padding: "1rem", fontWeight: 600 }}>Usluga</th>
                                <th style={{ padding: "1rem", fontWeight: 600 }}>Frizer</th>
                                <th style={{ padding: "1rem", fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                        Nema pronađenih zakazivanja.
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((apt) => {
                                    const dateOpts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
                                    const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

                                    const dateStr = new Intl.DateTimeFormat('sr-RS', dateOpts).format(apt.startTime);
                                    const startTimeStr = new Intl.DateTimeFormat('sr-RS', timeOpts).format(apt.startTime);
                                    const endTimeStr = new Intl.DateTimeFormat('sr-RS', timeOpts).format(apt.endTime);

                                    return (
                                        <tr key={apt.id} style={{ borderBottom: "1px solid var(--border-light)", transition: "var(--transition)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-hover)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                            <td style={{ padding: "1.25rem 1rem" }}>
                                                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{dateStr}</div>
                                                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                                    {startTimeStr} - {endTimeStr}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1rem" }}>
                                                <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{apt.user?.name ?? "—"}</div>
                                                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{apt.user ? (apt.user.phone || apt.user.email) : "—"}</div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1rem" }}>
                                                <div style={{ fontWeight: apt.isPause ? 700 : 400, color: apt.isPause ? "var(--accent)" : "inherit" }}>
                                                    {apt.isPause ? "PAUZA" : apt.service?.title || "—"}
                                                </div>
                                                {apt.service && (
                                                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{apt.service.duration} mins</div>
                                                )}
                                            </td>
                                            <td style={{ padding: "1rem" }}>{apt.employee.name}</td>
                                            <td style={{ padding: "1rem" }}>
                                                <span style={{
                                                    display: "inline-block",
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "var(--radius-sm)",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    backgroundColor: apt.status === "CONFIRMED" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                                    color: apt.status === "CONFIRMED" ? "#22c55e" : "#ef4444"
                                                }}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
