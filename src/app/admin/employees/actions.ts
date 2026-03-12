"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function createEmployee(formData: FormData) {
    await checkAdmin();

    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).trim().toLowerCase();
    const phone = (formData.get("phone") as string)?.trim() || null;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Korisnik sa ovim email-om već postoji.");
    }

    // Employees do not log in; store a non-guessable placeholder hash
    const placeholderHash = await bcrypt.hash("employee-no-login-" + Math.random(), 10);
    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: placeholderHash,
            phone,
            role: "EMPLOYEE",
        },
    });

    // Bypassing TypeScript error in current environment with 'as any'
    (revalidateTag as any)("employees");
    revalidatePath("/admin/employees");
    revalidatePath("/book");
    redirect("/admin/employees");
}

export async function updateEmployee(id: string, formData: FormData): Promise<{ error?: string }> {
    await checkAdmin();

    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).trim().toLowerCase();
    const phone = (formData.get("phone") as string)?.trim() || null;

    const employee = await prisma.user.findUnique({
        where: { id },
    });
    if (!employee || employee.role !== "EMPLOYEE") {
        return { error: "Zaposleni nije pronađen." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== id) {
        return { error: "Korisnik sa ovim email-om već postoji." };
    }

    await prisma.user.update({
        where: { id },
        data: { name, email, phone },
    });

    (revalidateTag as any)("employees");
    revalidatePath("/admin/employees");
    revalidatePath(`/admin/employees/${id}`);
    revalidatePath("/book");
    return {};
}

export async function deleteEmployee(id: string) {
    await checkAdmin();

    // Check if the employee has any appointments before deleting
    const appointmentCount = await prisma.appointment.count({
        where: { employeeId: id }
    });

    if (appointmentCount > 0) {
        throw new Error("Ne možete obrisati zaposlenog koji ima zakazane termine.");
    }

    await prisma.user.delete({
        where: { id },
    });

    (revalidateTag as any)("employees");
    revalidatePath("/admin/employees");
    revalidatePath("/book");
}
