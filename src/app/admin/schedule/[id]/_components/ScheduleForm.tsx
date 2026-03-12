"use client";

import { useState } from "react";
import { User, ChevronUp } from "lucide-react";
import css from "./ScheduleForm.module.css";
import IrregularScheduleTab, { type IrregularEntry } from "./IrregularScheduleTab";
import TimeOffTab, { type TimeOffEntry } from "./TimeOffTab";

export default function ScheduleForm({
    employeeId,
    employeeName,
    initialIrregular = [],
    initialTimeOffs = [],
    appointments = [],
}: {
    employeeId: string;
    employeeName: string;
    initialIrregular?: IrregularEntry[];
    initialTimeOffs?: TimeOffEntry[];
    appointments?: { id: string; startTime: string; endTime: string }[];
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={css.form}>
            <div
                className={css.employeeHeader}
                style={{
                    cursor: "pointer",
                    padding: "1.25rem",
                    borderBottom: isExpanded ? "1px solid var(--border)" : "none",
                    margin: 0
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={css.employeeInfo}>
                    <div className={css.employeeAvatar}>
                        <User size={22} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className={css.employeeName} style={{ margin: 0 }}>{employeeName}</h3>
                    </div>
                </div>
                <div className={css.headerActions}>
                    <button
                        type="button"
                        className={css.collapseBtn}
                        aria-label="Smanji / proširi"
                        style={{
                            transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
                            transition: "transform 0.2s"
                        }}
                    >
                        <ChevronUp size={20} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div style={{ padding: "0 1.25rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <IrregularScheduleTab employeeId={employeeId} initialEntries={initialIrregular} appointments={appointments} />
                    <TimeOffTab employeeId={employeeId} initialEntries={initialTimeOffs} appointments={appointments} />
                </div>
            )}
        </div>
    );
}
