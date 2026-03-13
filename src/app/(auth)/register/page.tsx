"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Greška pri registraciji");
            }

            // Auto login after successful registration
            const loginRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (loginRes?.error) {
                router.push("/login");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Registracija</h2>
                <p className="auth-subtitle">Kreirajte nalog za brže zakazivanje.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Ime i Prezime</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Petar Petrović"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email adresa</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="vas@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Broj Telefona (opciono)</label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0601234567"
                            maxLength={10}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Lozinka</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? "Registracija..." : "Registruj se"}
                    </button>
                </form>

                <div className="auth-footer">
                    Već imate nalog? <Link href="/login" className="auth-link">Prijavite se</Link>
                </div>
            </div>

            <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg-color);
        }
        .auth-card {
          background: var(--surface);
          padding: 3rem;
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 450px;
          border: 1px solid var(--border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        h2 {
          font-family: var(--font-serif);
          font-size: 2rem;
          margin-bottom: 0.5rem;
          text-align: center;
          color: var(--accent);
        }
        .auth-subtitle {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }
        input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-sans);
          transition: var(--transition);
        }
        input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .full-width {
          width: 100%;
          margin-top: 1rem;
        }
        .error-message {
          background: rgba(255, 60, 60, 0.1);
          color: #ff6b6b;
          padding: 0.8rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 60, 60, 0.2);
        }
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .auth-link {
          color: var(--accent);
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
}
