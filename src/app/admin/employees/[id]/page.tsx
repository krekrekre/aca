import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "../../admin.module.css";
import EditEmployeeForm from "./EditEmployeeForm";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const employee = await prisma.user.findUnique({
        where: { id },
    });

    if (!employee || employee.role !== "EMPLOYEE") {
        notFound();
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Izmena zaposlenog</h1>
                <p className={styles.pageDescription}>
                    Ažurirajte podatke za <strong>{employee.name}</strong>.
                </p>
            </div>
            <EditEmployeeForm employee={employee} />
        </div>
    );
}
