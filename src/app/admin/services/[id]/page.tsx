import { updateService } from "../actions";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../admin.module.css";
import EditServiceForm from "./EditServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: { extraServices: true },
  });

  if (!service) {
    notFound();
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Izmena Usluge</h1>
        <p className={styles.pageDescription}>
          Ažurirajte detalje za <strong>{service.title}</strong>.
        </p>
      </div>
      <EditServiceForm service={service} />
    </div>
  );
}
