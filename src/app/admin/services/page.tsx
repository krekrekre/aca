import prisma from "@/lib/prisma";
import Link from "next/link";
import styles from "../admin.module.css";
import DeleteServiceButton from "./_components/DeleteServiceButton";
import { Clock, Scissors } from "lucide-react";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div
        className={styles.pageHeader}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 className={styles.pageTitle}>Usluge</h1>
          <p className={styles.pageDescription}>
            Upravljajte uslugama koje nudi frizerski salon.
          </p>
        </div>
        <Link href="/admin/services/new" className="btn btn-primary">
          Dodaj Novu Uslugu
        </Link>
      </div>

      {services.length === 0 ? (
        <div
          className={styles.card}
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          Nema pronađenih usluga.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {services.map((service) => (
            <div
              key={service.id}
              className={styles.card}
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(211, 140, 65, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Scissors size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1, marginTop: "0.15rem" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {service.title}
                  </h3>
                  {service.description && (
                    <p
                      style={{
                        margin: "0.5rem 0 0",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {service.description.length > 80
                        ? `${service.description.substring(0, 80)}…`
                        : service.description}
                    </p>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <Clock size={16} />
                <span>{service.duration} min</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  {service.price.toFixed(0)} RSD
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "auto",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <Link
                  href={`/admin/services/${service.id}`}
                  className="btn btn-outline"
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    textAlign: "center",
                  }}
                >
                  Izmeni
                </Link>
                <DeleteServiceButton id={service.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
