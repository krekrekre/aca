"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Scissors,
    Users,
    UserCircle,
    CalendarClock,
    Settings,
    CalendarDays,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "../admin.module.css";
import { useAdminHeaderSlot } from "./AdminHeaderSlotContext";
import { BRAND_CONFIG } from '@/config/brand';

const navItems = [
    { href: "/admin", label: "Kontrolna tabla", icon: LayoutDashboard },
    { href: "/admin/kalendar", label: "Kalendar", icon: CalendarDays },
    { href: "/admin/schedule", label: "Raspored", icon: CalendarClock },
    { href: "/admin/services", label: "Usluge", icon: Scissors },
    { href: "/admin/employees", label: "Zaposleni", icon: Users },
    { href: "/admin/klijenti", label: "Klijenti", icon: UserCircle },
    { href: "/admin/settings", label: "Podešavanja", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const headerSlot = useAdminHeaderSlot();
    const mobileOpen = headerSlot?.sidebarOpen ?? false;
    const setMobileOpen = headerSlot?.setSidebarOpen ?? (() => { });

    // Close sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname, setMobileOpen]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`${styles.sidebarOverlay} ${mobileOpen ? styles.visible : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <button
                        className={styles.mobileCloseBtn}
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <X size={24} />
                    </button>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <h2 style={{ cursor: "pointer", color: "var(--accent)" }}>{BRAND_CONFIG.name} Admin</h2>
                    </Link>
                </div>
                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={styles.navLink}
                                data-active={isActive}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className={styles.sidebarLogout}
                    >
                        <LogOut size={20} />
                        Odjavi se
                    </button>
                </div>
            </aside>
        </>
    );
}
