import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { AdminHeaderSlotProvider } from "./_components/AdminHeaderSlotContext";
import styles from "./admin.module.css";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    return (
        <AdminHeaderSlotProvider>
            <div className={styles.adminContainer}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <Header user={session.user} />
                    <div className={styles.content}>{children}</div>
                </main>
            </div>
        </AdminHeaderSlotProvider>
    );
}
