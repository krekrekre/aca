import styles from "./admin.module.css";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

export const dynamic = "force-dynamic";

function getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

export default async function AdminDashboardPage() {
    const todayRange = getTodayRange();

    const [totalEmployees, totalServices, appointmentsToday, nextAppointment] = await Promise.all([
        prisma.user.count({ where: { role: "EMPLOYEE" } }),
        prisma.service.count(),
        prisma.appointment.count({
            where: {
                status: { in: ["CONFIRMED", "PENDING"] },
                startTime: { gte: todayRange.start, lt: todayRange.end },
            },
        }),
        prisma.appointment.findFirst({
            where: {
                status: { in: ["CONFIRMED", "PENDING"] },
                startTime: { gte: new Date() },
            },
            orderBy: { startTime: "asc" },
            select: {
                id: true,
                startTime: true,
                isPause: true,
                service: { select: { title: true } },
                user: { select: { name: true } },
                employee: { select: { name: true } },
            },
        }) as Promise<any>,
    ]);

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Kontrolna tabla</h1>
                <p className={styles.pageDescription}>Dobrodošli na Brica panel za administraciju.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <div className={styles.card} style={{ display: "flex", flexDirection: "column" }}>
                    <h2 className={styles.cardTitle}>Danas</h2>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "1rem" }}>
                        <p style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{appointmentsToday}</p>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>zakazano</span>
                    </div>
                </div>

                <div className={styles.card} style={{ display: "flex", flexDirection: "column" }}>
                    <h2 className={styles.cardTitle}>Tim</h2>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "1rem" }}>
                        <p style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{totalEmployees}</p>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>zaposlenih</span>
                    </div>
                </div>

                <div className={styles.card} style={{ display: "flex", flexDirection: "column" }}>
                    <h2 className={styles.cardTitle}>Usluge</h2>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "1rem" }}>
                        <p style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{totalServices}</p>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>aktivnih</span>
                    </div>
                </div>
            </div>

            {nextAppointment && (
                <div className={styles.card} style={{ marginTop: "1.5rem", background: "linear-gradient(145deg, var(--surface) 0%, rgba(212, 175, 55, 0.05) 100%)", border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                        <h2 className={styles.cardTitle} style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}></span>
                            Sledeći termin
                        </h2>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center" }}>
                        <div>
                            <p style={{ margin: "0", fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                {format(new Date(nextAppointment.startTime), "d. MMMM yyyy · HH:mm", { locale: sr })}
                            </p>
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", alignItems: "center" }}>
                                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", background: nextAppointment.isPause ? "rgba(212, 175, 55, 0.15)" : "var(--surface-hover)", fontSize: "0.85rem", color: nextAppointment.isPause ? "var(--accent)" : "var(--text-primary)", fontWeight: nextAppointment.isPause ? 700 : 400 }}>
                                    {nextAppointment.isPause ? "PAUZA" : nextAppointment.service?.title || "Nema naslova"}
                                </span>
                                {nextAppointment.user?.name && (
                                    <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                                        Klijent: <span style={{ color: "var(--text-primary)" }}>{nextAppointment.user.name}</span>
                                    </span>
                                )}
                                {nextAppointment.employee?.name && (
                                    <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                                        Majstor: <span style={{ color: "var(--text-primary)" }}>{nextAppointment.employee.name}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link
                            href="/admin/kalendar"
                            className="btn btn-primary"
                        >
                            Otvori kalendar
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
