"use client";

import { deleteService } from "../actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import styles from "../../admin.module.css";

export default function DeleteServiceButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsPending(true);
    try {
      const result = await deleteService(id);
      if (result.error) {
        alert(result.error);
        setIsPending(false);
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    } catch (error) {
      alert("Brisanje usluge nije uspelo.");
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
        className={`btn btn-outline`}
        style={{
          padding: "0.5rem 1rem",
          borderColor: "#ef4444",
          color: "#ef4444",
        }}
        title="Obriši uslugu"
      >
        <Trash2
          size={16}
          style={{ display: "inline-block", verticalAlign: "middle" }}
        />
        {isPending ? "..." : ""}
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Potvrda brisanja</h3>
            <p className={styles.modalText}>Da li ste sigurni da želite da obrišete ovu uslugu?</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
              >
                Otkaži
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Brisanje..." : "Obriši"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
