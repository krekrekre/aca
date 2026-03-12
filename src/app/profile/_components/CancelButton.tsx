'use client';

import { useState } from 'react';
import { cancelAppointment } from '../actions';
import { X, AlertCircle } from 'lucide-react';

export default function CancelButton({ id }: { id: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCancel = async () => {
    setIsPending(true);
    try {
      await cancelAppointment(id);
      setIsModalOpen(false);
    } catch (err) {
      alert('Neuspešno otkazivanje termina. Pokušajte ponovo.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="btn-cancel-trigger"
      >
        Otkaži
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="warning-icon">
                <AlertCircle size={32} />
              </div>
              <h2>Otkaži Termin?</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <p className="modal-body">
              Da li ste sigurni da želite da otkažete ovaj termin? Ova akcija se ne može poništiti.
            </p>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
              >
                Odustani
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleCancel}
                disabled={isPending}
              >
                {isPending ? 'Otkazivanje...' : 'Da, Otkaži'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-cancel-trigger {
          background: rgba(255, 107, 107, 0.08);
          color: #ff6b6b;
          border: 1px solid rgba(255, 107, 107, 0.2);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel-trigger:hover {
          background: #ff6b6b;
          color: white;
          border-color: #ff6b6b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
        }

        .modal-content {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          max-width: 440px;
          width: 100%;
          padding: 2.5rem;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
          animation: modalAppear 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .warning-icon {
          color: #ff6b6b;
          margin-bottom: 1.25rem;
          display: flex;
          justify-content: center;
        }

        h2 {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          margin: 0;
        }

        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal-body {
          color: var(--text-secondary);
          text-align: center;
          line-height: 1.6;
          margin-bottom: 2.5rem;
          font-size: 1.05rem;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .btn {
          padding: 0.85rem;
          font-weight: 500;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.95rem;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }

        .btn-danger {
          background: #ff6b6b;
          color: white;
        }

        .btn-danger:hover {
          background: #ff5252;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
