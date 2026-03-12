'use client';

import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { updateProfile } from '../actions';

interface EditProfileProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
}

export default function EditProfile({ initialName, initialEmail, initialPhone }: EditProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name === initialName && email === initialEmail && phone === initialPhone) {
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      await updateProfile({ name, email, phone });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Neuspešno ažuriranje profila.');
    } finally {
      setIsPending(false);
    }
  };

  if (isEditing) {
    return (
      <div className="edit-overlay">
        <form onSubmit={handleSubmit} className="edit-form card">
          <div className="modal-header">
            <h3>Izmeni Profil</h3>
            <button type="button" className="close-btn" onClick={() => setIsEditing(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="form-body">
            <div className="input-group">
              <label htmlFor="name">Ime i Prezime</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Unesite vaše ime"
                disabled={isPending}
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Adresa</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
                disabled={isPending}
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Broj Telefona</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06x xxxxxxx"
                disabled={isPending}
              />
            </div>

            {error && <div className="error-box">{error}</div>}
          </div>

          <div className="edit-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              Otkaži
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isPending || name.trim().length < 2}
            >
              {isPending ? 'Čuvanje...' : 'Sačuvaj Izmene'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .edit-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2200;
            padding: 1.5rem;
          }

          .edit-form {
            background: #111;
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 480px;
            padding: 2rem;
            box-shadow: 0 40px 80px rgba(0,0,0,0.8);
            animation: modalIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          @keyframes modalIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          h3 {
            font-family: var(--font-serif);
            font-size: 1.5rem;
            margin: 0;
            color: var(--accent);
          }

          .close-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            transition: color 0.2s;
            padding: 0.5rem;
          }

          .close-btn:hover {
            color: #fff;
          }

          .form-body {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
          }

          .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-secondary);
            font-weight: 600;
          }

          input {
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 0.85rem 1rem;
            color: var(--text-primary);
            font-size: 0.95rem;
            width: 100%;
            transition: all 0.2s ease;
          }

          input:focus {
            outline: none;
            border-color: var(--accent);
            background: rgba(255,255,255,0.05);
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
          }

          .error-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            font-size: 0.9rem;
          }

          .edit-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .btn {
            padding: 0.85rem;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .btn-secondary {
            background: rgba(255,255,255,0.05);
            color: #fff;
            border: 1px solid var(--border);
          }

          .btn-secondary:hover {
            background: rgba(255,255,255,0.1);
          }

          .btn-primary {
            background: var(--accent);
            color: #000;
          }

          .btn-primary:hover:not(:disabled) {
            background: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <button className="edit-pencil-btn" onClick={() => setIsEditing(true)}>
      <Pencil size={18} />
      <style jsx>{`
        .edit-pencil-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-secondary);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .edit-pencil-btn:hover {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
          transform: rotate(15deg) scale(1.1);
          box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
        }
      `}</style>
    </button>
  );
}
