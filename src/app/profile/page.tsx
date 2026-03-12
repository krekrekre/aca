import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileView from "./_components/ProfileView";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/login");
    }

    const now = new Date();

    // Get upcoming and past appointments
    const allAppointments = await prisma.appointment.findMany({
        where: { userId: session.user.id },
        orderBy: { startTime: "asc" },
        include: {
            service: true,
            employee: true,
        },
    }) as any[];

    // Serialize dates for client component
    const serializedAppointments = JSON.parse(JSON.stringify(allAppointments));

    const upcoming = serializedAppointments.filter((apt: any) => 
        new Date(apt.startTime) > now && apt.status !== "CANCELLED"
    );
    const past = serializedAppointments.filter((apt: any) => 
        new Date(apt.startTime) <= now || apt.status === "CANCELLED"
    );

    return (
        <ProfileView 
            user={{
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }}
            upcoming={upcoming}
            past={past}
        />
    );
}
