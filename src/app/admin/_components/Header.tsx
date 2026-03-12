"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useAdminHeaderSlot } from "./AdminHeaderSlotContext";
import Link from "next/link";
import styles from "../admin.module.css";

const PAGE_TITLES: Record<string, string> = {
    "/admin": "Kontrolna tabla",
    "/admin/kalendar": "Kalendar",
    "/admin/appointments": "Sva Zakazivanja",
    "/admin/schedule": "Upravljanje Rasporedom",
    "/admin/settings": "Globalna Podešavanja",
    "/admin/employees": "Zaposleni",
    "/admin/employees/new": "Dodaj Novog Zaposlenog",
    "/admin/services": "Usluge",
    "/admin/services/new": "Dodaj Novu Uslugu",
};

function getPageTitle(pathname: string): string {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.startsWith("/admin/schedule/")) return "Raspored";
    if (pathname.startsWith("/admin/services/")) return "Izmena Usluge";
    return "Admin";
}

interface HeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export default function Header({ user }: HeaderProps) {
    const pathname = usePathname();
    const pageTitle = getPageTitle(pathname ?? "");
    const { content: headerSlotContent, sidebarOpen, setSidebarOpen } = useAdminHeaderSlot() ?? {
        content: null,
        sidebarOpen: false,
        setSidebarOpen: () => { }
    };

    const showPageTitle = pathname === "/admin/kalendar";

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {showPageTitle && (
                    <h1 className={styles.pageTitle} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", margin: 0, marginRight: "1rem" }}>
                        {pageTitle}
                    </h1>
                )}
            </div>

            {headerSlotContent != null && (
                <div className={styles.headerSlotWrapper} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    {headerSlotContent}
                </div>
            )}
        </header>
    );
}
