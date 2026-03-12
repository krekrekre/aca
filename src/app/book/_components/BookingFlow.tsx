"use client";

import { useBooking } from "./BookingContext";
import { Service, User } from "@prisma/client";
import Step1Time from "./Step1Time";
import BookingModal from "./BookingModal";
import { Scissors, Users, Calendar, CheckCircle } from "lucide-react";

export default function BookingFlow({ 
    services, 
    employees, 
    slotDurationMinutes = 30,
    maxBookingAdvanceDays = 30,
    schedules = [],
    irregularSchedules = [],
    currentUser
}: { 
    services: Service[]; 
    employees: User[]; 
    slotDurationMinutes?: number;
    maxBookingAdvanceDays?: number;
    schedules?: any[];
    irregularSchedules?: any[];
    currentUser?: { id?: string; role?: string };
}) {
    const { state } = useBooking();
    return (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem clamp(0.5rem, 3vw, 1rem)" }}>
            {/* Unified Flow Content */}
            <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                <Step1Time 
                    employees={employees} 
                    slotDurationMinutes={slotDurationMinutes} 
                    maxBookingAdvanceDays={maxBookingAdvanceDays}
                    schedules={schedules}
                    irregularSchedules={irregularSchedules}
                    currentUser={currentUser}
                />
            </div>

            {/* Consolidated Booking Modal */}
            <BookingModal services={services} />

            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
