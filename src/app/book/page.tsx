import prisma from "@/lib/prisma";
import { BookingProvider } from "./_components/BookingContext";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import BookingFlow from "./_components/BookingFlow";
import Link from "next/link";
import { getCachedServices, getCachedEmployees, getCachedSettings, getCachedSchedules, getCachedIrregularSchedules } from "@/lib/data-fetching";
import { BRAND_CONFIG } from "@/config/brand";

export const dynamic = 'force-dynamic';

export default async function BookPage() {
    const session = await getServerSession(authOptions);
    const [services, employees, settings, schedules, irregularSchedules] = await Promise.all([
        getCachedServices(),
        getCachedEmployees(),
        getCachedSettings(),
        getCachedSchedules(),
        getCachedIrregularSchedules(),
    ]);

    const slotDurationMinutes = settings?.appointmentDuration ?? 30;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
            {/* Simple Header for booking flow */}
            <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                            src={BRAND_CONFIG.logoPath} 
                            alt={BRAND_CONFIG.name} 
                            style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
                        />
                        <h1 style={{ 
                            fontSize: "clamp(1.4rem, 5.5vw, 1.9rem)", 
                            color: "var(--accent)", 
                            margin: 0, 
                            cursor: "pointer", 
                            whiteSpace: "nowrap",
                            textAlign: "left",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontFamily: "var(--font-serif)"
                        }}>
                            {BRAND_CONFIG.name} zakazivanje
                        </h1>
                    </Link>
                </div>
            </header>

            <main>
                <BookingProvider>
                    <BookingFlow 
                        services={services} 
                        employees={employees} 
                        slotDurationMinutes={slotDurationMinutes}
                        maxBookingAdvanceDays={settings?.maxBookingAdvanceDays ?? 30}
                        schedules={JSON.parse(JSON.stringify(schedules))}
                        irregularSchedules={JSON.parse(JSON.stringify(irregularSchedules))}
                        currentUser={{ id: session?.user?.id, role: session?.user?.role }}
                    />
                </BookingProvider>
            </main>
        </div>
    );
}
