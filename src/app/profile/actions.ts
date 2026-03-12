"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function cancelAppointment(appointmentId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
    });

    if (!appointment) {
        throw new Error("Appointment not found");
    }

    // Ensure user can only cancel their own appointments unless they are an admin
    if (appointment.userId !== session.user.id && session.user.role !== "ADMIN") {
        throw new Error("Unauthorized to cancel this appointment");
    }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CANCELLED" },
    });

    revalidatePath("/profile");
}

export async function updateProfile(data: { name: string; email?: string; phone?: string }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const { name, email, phone } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Ime mora imati najmanje 2 karaktera.");
    }

    // Optional: Email validation
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error("Neispravan format email adrese.");
    }

    // Check if email is already taken by another user
    if (email && email !== session.user.email) {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error("Email adresa je već u upotrebi.");
        }
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { 
            name: name.trim(),
            email: email?.trim(),
            phone: phone?.trim(),
        },
    });

    revalidatePath("/profile");
}
