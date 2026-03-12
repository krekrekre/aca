"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (res?.error) {
            setError("Pogrešan email ili lozinka.");
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Prijava</h2>
                <p className="auth-subtitle">Dobrodošli nazad. Prijavite se za zakazivanje.</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                        <label htmlFor="password">Lozinka</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? "Prijava..." : "Prijavi se"}
                    </button>
                </form>

                <div className="auth-footer">
                    Nemate nalog? <Link href="/register" className="auth-link">Registrujte se</Link>
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
