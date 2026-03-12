import prisma from "@/lib/prisma";
import styles from "../admin.module.css";
import SettingsForm from "./_components/SettingsForm";

export default async function SettingsPage() {
    let settings = await prisma.settings.findFirst();

    if (!settings) {
        settings = await prisma.settings.create({
            data: { maxBookingAdvanceDays: 30, appointmentDuration: 30, maxBookingsPerMonth: 5 },
        });
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Globalna Podešavanja</h1>
                <p className={styles.pageDescription}>Upravljajte sistemskom konfiguracijom.</p>
            </div>

            <div className={styles.card} style={{ maxWidth: "600px" }}>
                <SettingsForm settings={settings} />
            </div>
        </div>
    );
}
