import prisma from "@/lib/prisma";
import styles from "../admin.module.css";
import ClientList from "./_components/ClientList";

export default async function KlijentiPage() {
    const clients = await prisma.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true, phone: true },
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Klijenti</h1>
                <p className={styles.pageDescription}>
                    Lista svih klijenata koji su se zakazivali ili imaju nalog.
                </p>
            </div>

            <ClientList clients={clients} />
        </div>
    );
}
