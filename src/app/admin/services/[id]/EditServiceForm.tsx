"use client";

import { updateService } from "../actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin.module.css";
import { Service, ExtraService } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";

export default function EditServiceForm({ service }: { service: Service & { extraServices?: ExtraService[] } }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [extras, setExtras] = useState<{ id: string | number; title: string; duration: number; price: number }[]>(
    service.extraServices?.map(e => ({ id: e.id, title: e.title, duration: e.duration, price: e.price })) || []
  );

  const addExtra = () => {
    setExtras([...extras, { id: Date.now(), title: "", duration: 0, price: 0 }]);
  };

  const removeExtra = (id: string | number) => {
    setExtras(extras.filter(e => e.id !== id));
  };

  const updateExtra = (id: string | number, field: string, value: any) => {
    setExtras(extras.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateService(service.id, formData);
      if (result?.error) {
        alert(result.error);
      } else {
        router.push("/admin/services");
        return;
      }
    } catch (err) {
      alert("Greška pri ažuriranju usluge");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={styles.card} style={{ maxWidth: "600px" }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Naziv
          </label>
          <input
            name="title"
            required
            type="text"
            defaultValue={service.title}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-color)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Opis (opciono)
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={service.description || ""}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-color)",
              color: "var(--text-primary)",
              resize: "vertical",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Trajanje (minuti)
            </label>
            <input
              name="duration"
              required
              type="number"
              min="5"
              step="5"
              defaultValue={service.duration}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Cena (RSD)
            </label>
            <input
              name="price"
              required
              type="number"
              min="0"
              step="1"
              defaultValue={service.price}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--bg-color)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Dodatne usluge (opciono)</h3>
            <button 
                type="button" 
                onClick={addExtra}
                className="btn btn-outline"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
                <Plus size={16} /> Dodaj stavku
            </button>
          </div>

          {extras.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontStyle: "italic" }}>
                Nema dodatih dodatnih usluga.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {extras.map((extra, index) => (
                    <div key={extra.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 40px", gap: "0.75rem", alignItems: "end", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Naziv</label>
                            <input 
                                name={`extraTitle_${index}`}
                                value={extra.title}
                                onChange={(e) => updateExtra(extra.id, "title", e.target.value)}
                                required
                                placeholder="Npr. Pranje kose"
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Min</label>
                            <input 
                                name={`extraDuration_${index}`}
                                type="number"
                                value={extra.duration}
                                onChange={(e) => updateExtra(extra.id, "duration", parseInt(e.target.value) || 0)}
                                required
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>Cena</label>
                            <input 
                                name={`extraPrice_${index}`}
                                type="number"
                                value={extra.price}
                                onChange={(e) => updateExtra(extra.id, "price", parseFloat(e.target.value) || 0)}
                                required
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => removeExtra(extra.id)}
                            style={{ height: "36px", width: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: "var(--radius-sm)", color: "#ef4444", cursor: "pointer" }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                <input type="hidden" name="extrasCount" value={extras.length} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {isPending ? "Čuvanje..." : "Ažuriraj Uslugu"}
          </button>
          <Link
            href="/admin/services"
            className="btn btn-outline"
            style={{ textAlign: "center", flex: 1 }}
          >
            Otkaži
          </Link>
        </div>
      </form>
    </div>
  );
}
