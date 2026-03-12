import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { name, email, password, phone } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                phone: phone || null,
                role: "USER", // Default role
            },
        });

        return NextResponse.json(
            { message: "User registered successfully", userId: newUser.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error in register route:", error);
        return NextResponse.json(
            { message: "Internal server error: " + error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
