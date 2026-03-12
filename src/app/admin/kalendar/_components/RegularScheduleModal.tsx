"use client";

import { X } from "lucide-react";
import styles from "./AddAppointmentModal.module.css";
import RegularScheduleTab, { type RegularEntry } from "@/app/admin/_components/RegularScheduleTab";

interface Props {
    employeeId: string;
    employeeName: string;
    initialEntries: RegularEntry[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegularScheduleModal({ 
    employeeId, 
    employeeName, 
    initialEntries, 
    onClose, 
    onSuccess 
}: Props) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div 
                className={styles.modal} 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px", width: "95%" }}
            >
                <header className={styles.header}>
                    <h2 className={styles.title}>Redovno radno vreme: {employeeName}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.body} style={{ maxHeight: "80vh", overflowY: "auto" }}>
                    <RegularScheduleTab 
                        employeeId={employeeId} 
                        initialEntries={initialEntries} 
                        onSuccess={onSuccess}
                        showTitle={false}
                    />
                </div>
            </div>
        </div>
    );
}
