"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Service, User } from "@prisma/client";

export type BookingStep = 1 | 2 | 3;

interface TimeSlot {
    time: string; // ISO String
    maxDuration: number; // Mins
}

interface BookingState {
    step: BookingStep;
    selectedEmployee: User | null;
    selectedDate: Date | null;
    selectedTimeSlot: TimeSlot | null;
    selectedService: (Service & { extraServices?: any[] }) | null;
    selectedExtras: Set<string>; // IDs of selected extras
}

interface BookingContextType {
    state: BookingState;
    setStep: (step: BookingStep) => void;
    setEmployee: (employee: User | null) => void;
    setDate: (date: Date | null) => void;
    setTimeSlot: (timeSlot: TimeSlot | null) => void;
    setService: (service: (Service & { extraServices?: any[] }) | null) => void;
    toggleExtra: (id: string) => void;
    resetBooking: () => void;
}

const initialState: BookingState = {
    step: 1,
    selectedEmployee: null, // Will be set forcefully by Step1
    selectedDate: null,
    selectedTimeSlot: null,
    selectedService: null,
    selectedExtras: new Set(),
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingState>(initialState);

    const setStep = (step: BookingStep) => setState((prev) => ({ ...prev, step }));
    const setEmployee = (employee: User | null) => setState((prev) => ({ ...prev, selectedEmployee: employee, selectedTimeSlot: null }));
    const setDate = (date: Date | null) => setState((prev) => ({ ...prev, selectedDate: date }));
    const setTimeSlot = (timeSlot: TimeSlot | null) => setState((prev) => ({ ...prev, selectedTimeSlot: timeSlot, selectedService: null, selectedExtras: new Set() }));
    const setService = (service: (Service & { extraServices?: any[] }) | null) => setState((prev) => ({ ...prev, selectedService: service, selectedExtras: new Set() }));
    
    const toggleExtra = (id: string) => setState((prev) => {
        const next = new Set(prev.selectedExtras);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { ...prev, selectedExtras: next };
    });

    const resetBooking = () => setState(initialState);

    return (
        <BookingContext.Provider
            value={{
                state,
                setStep,
                setEmployee,
                setDate,
                setTimeSlot,
                setService,
                toggleExtra,
                resetBooking,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error("useBooking must be used within a BookingProvider");
    }
    return context;
}
