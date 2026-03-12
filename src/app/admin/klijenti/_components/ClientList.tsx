"use client";

import { useState, useMemo } from "react";
import { Search, User, Mail, Phone, Users, ShieldAlert } from "lucide-react";
import styles from "./ClientList.module.css";

type Client = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
};

export default function ClientList({ clients }: { clients: Client[] }) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return clients;
        return clients.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone && c.phone.toLowerCase().includes(q))
        );
    }, [clients, search]);

    return (
        <div className={styles.container}>
            <div className={styles.searchCard}>
                <div className={styles.searchWrap}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="search"
                        placeholder="Pretraži klijente po imenu, emailu ili telefonu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                        aria-label="Pretraži klijente"
                    />
                </div>
                
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{clients.length}</span>
                        <span className={styles.statLabel}>Ukupno</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{filtered.length}</span>
                        <span className={styles.statLabel}>Pronađeno</span>
                    </div>
                </div>
            </div>

            <div className={styles.listCard}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ShieldAlert size={64} className={styles.emptyIcon} />
                        <p>
                            {search.trim() 
                                ? "Nema klijenata koji odgovaraju pretrazi." 
                                : "Trenutno nemate registrovanih klijenata."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableHeader}>
                            <div></div>
                            <div>Ime i prezime</div>
                            <div>Email adresa</div>
                            <div>Telefon</div>
                        </div>
                        <ul className={styles.list}>
                            {filtered.map((client) => (
                                <li key={client.id} className={styles.item}>
                                    <div className={styles.avatar}>
                                        <User size={24} />
                                    </div>
                                    <div className={styles.clientName}>
                                        {client.name}
                                    </div>
                                    <div className={styles.infoCell}>
                                        <Mail size={16} className={styles.infoIcon} />
                                        <span className={styles.infoText}>{client.email}</span>
                                    </div>
                                    <div className={styles.infoCell}>
                                        <Phone size={16} className={styles.infoIcon} />
                                        <span className={styles.infoText}>{client.phone || "—"}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}
