"use client";

import { useBooking } from "./BookingContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function Step3Confirm() {
    const { state, setStep } = useBooking();
    const router = useRouter();
    const { data: session } = useSession();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    if (!state.selectedEmployee || !state.selectedService || !state.selectedTimeSlot) {
        return <div style={{ color: "#ef4444" }}>Error: Missing selections. <button onClick={() => setStep(1)} className="btn-text">Start Over</button></div>;
    }

    const aptDate = new Date(state.selectedTimeSlot.time);

    const handleConfirm = async () => {
        if (!session) {
            // User is not logged in. Force login. Redirect back to /book afterward.
            signIn(undefined, { callbackUrl: "/book" });
            return;
        }

        setIsPending(true);
        setError("");

        try {
            const res = await fetch("/api/booking/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: state.selectedEmployee.id,
                    serviceId: state.selectedService.id,
                    startTime: state.selectedTimeSlot.time,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to confirm appointment");
            }

            // Success
            router.push("/profile?booking=success");

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setIsPending(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Review & Confirm</h2>
                <button onClick={() => setStep(2)} className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>
                    Back
                </button>
            </div>

            {error && (
                <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                    {error}
                </div>
            )}

            <div className="card" style={{ padding: "2rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>

                <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{state.selectedService.title}</h3>
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                        {state.selectedService.duration} mins • {state.selectedService.price.toFixed(0)} RSD
                    </p>
                </div>

                <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Barber</h3>
                    <p style={{ fontSize: "1.1rem", margin: 0, fontWeight: 500 }}>
                        {state.selectedEmployee.name}
                    </p>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Date & Time</h3>
                    <p style={{ fontSize: "1.1rem", margin: 0, fontWeight: 500 }}>
                        {aptDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p style={{ fontSize: "1.2rem", margin: "0.5rem 0 0 0", color: "var(--accent)", fontWeight: 600 }}>
                        {aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                </div>

                {!session ? (
                    <div>
                        <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>You must be logged in to confirm your booking.</p>
                        <button
                            onClick={handleConfirm}
                            className="btn btn-primary"
                            style={{ width: "100%", textAlign: "center", fontSize: "1.1rem" }}
                        >
                            Sign In to Confirm
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="btn btn-primary"
                        style={{ width: "100%", textAlign: "center", fontSize: "1.1rem" }}
                    >
                        {isPending ? "Confirming..." : "Confirm Appointment"}
                    </button>
                )}
            </div>
        </div>
    );
}
