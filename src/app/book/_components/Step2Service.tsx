"use client";

import { useBooking } from "./BookingContext";
import { Service } from "@prisma/client";

export default function Step2Service({ services }: { services: Service[] }) {
    const { state, setService, setStep } = useBooking();

    const maxAvailableTime = state.selectedTimeSlot?.maxDuration || 0;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Select a Service</h2>
                <button
                    onClick={() => setStep(1)}
                    className="btn btn-outline"
                    style={{ padding: "0.5rem 1rem" }}
                >
                    Back
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {services.map((service) => {
                    const canFit = service.duration <= maxAvailableTime;

                    return (
                        <div
                            key={service.id}
                            onClick={() => {
                                if (canFit) {
                                    setService(service);
                                    setStep(3);
                                }
                            }}
                            style={{
                                padding: "1.5rem",
                                border: `2px solid ${state.selectedService?.id === service.id ? "var(--accent)" : "var(--border)"}`,
                                borderRadius: "var(--radius-lg)",
                                cursor: canFit ? "pointer" : "not-allowed",
                                transition: "var(--transition)",
                                background: "var(--surface)",
                                opacity: canFit ? 1 : 0.4,
                            }}
                            onMouseOver={(e) => {
                                if (canFit && state.selectedService?.id !== service.id) e.currentTarget.style.borderColor = "var(--text-secondary)";
                            }}
                            onMouseOut={(e) => {
                                if (canFit && state.selectedService?.id !== service.id) e.currentTarget.style.borderColor = "var(--border)";
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{service.title}</h3>
                                <span style={{ fontWeight: 600, color: "var(--accent)" }}>{service.price.toFixed(0)} RSD</span>
                            </div>
                            {service.description && (
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                                    {service.description}
                                </p>
                            )}
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span>⏱ {service.duration} mins</span>
                                {!canFit && <span style={{ color: "#ef4444", marginLeft: "auto" }}>Not enough time</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
