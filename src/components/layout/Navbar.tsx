'use client';

import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { BRAND_CONFIG } from '@/config/brand';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link href="/#hero" className="logo">
          <img src={BRAND_CONFIG.logoPath} alt={BRAND_CONFIG.name} className="logo-img" />
        </Link>

        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link href="/#usluge" className="nav-link" onClick={() => setMenuOpen(false)}>Usluge</Link>
          <Link href="/#o-nama" className="nav-link" onClick={() => setMenuOpen(false)}>O Nama</Link>
          <Link href="/#lokacija" className="nav-link" onClick={() => setMenuOpen(false)}>Lokacija</Link>
          {session?.user?.role === 'ADMIN' ? (
            <Link href="/admin" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          ) : (
            <Link href="/book" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Zakaži Termin
            </Link>
          )}

          {/* Auth Navigation */}
          {status === "loading" ? (
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Učitavanje...</span>
          ) : session ? (
            session.user.role === 'ADMIN' ? (
              <button
                onClick={() => signOut()}
                className="auth-link"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
              >
                Odjava
              </button>
            ) : (
              <div className="account-dropdown">
                <button className="account-btn" aria-label="Nalog">
                  <User size={22} strokeWidth={1.5} />
                </button>
                <div className="account-dropdown-menu">
                  <button
                    onClick={() => { router.push('/profile'); setMenuOpen(false); }}
                    className="account-dropdown-item account-dropdown-profil"
                  >
                    Profil
                  </button>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="account-dropdown-item account-logout"
                  >
                    Odjava
                  </button>
                </div>
              </div>
            )
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="auth-link">
              Prijava
            </Link>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 1000;
          transition: all 0.4s ease;
          padding: 1rem 5%;
          pointer-events: none;
        }

        .navbar.scrolled {
          padding-top: 1rem;
        }

        .nav-container {
          pointer-events: auto;
          width: 100%;
          max-width: 1400px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.4s ease;
          padding: 0.5rem 0;
        }

        .navbar.scrolled .nav-container {
          background: #0a0a0a;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 1rem 2.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .logo {
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .logo:hover {
          opacity: 0.8;
          transform: scale(1.02);
        }

        .logo-img {
          height: 85px;
          width: auto;
          object-fit: contain;
          transition: all 0.3s ease-out;
        }

        .navbar.scrolled .logo-img {
          height: 60px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 3rem;
        }

        .nav-link {
          color: var(--text-primary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          position: relative;
          padding-bottom: 2px;
          transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link:hover {
          color: var(--accent);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--accent);
          transition: var(--transition);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Account Dropdown */
        .account-dropdown {
          position: relative;
          display: flex;
          align-items: center;
        }

        .account-dropdown::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 16px;
        }

        .account-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: color 0.2s, background 0.2s, border-color 0.2s;
        }

        .account-dropdown:hover .account-btn {
          color: var(--accent);
          background: rgba(212, 175, 55, 0.08);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .account-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          min-width: 160px;
          padding: 0.5rem;
          background: rgba(14, 14, 14, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-6px);
          transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
          z-index: 1050;
        }

        .account-dropdown:hover .account-dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .account-dropdown-item {
          display: block;
          width: 100%;
          padding: 0.65rem 1rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: left;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          box-sizing: border-box;
        }

        .account-dropdown-profil {
          padding-left: 1.25rem;
        }

        .account-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--accent);
        }

        .account-logout {
          color: rgba(255, 120, 120, 0.95);
        }

        .account-logout:hover {
          background: rgba(255, 100, 100, 0.1);
          color: #ff8888;
        }

        .auth-link {
          color: var(--text-primary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          position: relative;
          transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          padding-bottom: 2px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .auth-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--accent);
          transition: var(--transition);
        }

        .auth-link:hover {
          color: var(--accent);
        }

        .auth-link:hover::after {
          width: 100%;
        }

        @media (max-width: 900px) {
          .navbar {
            padding: 0.75rem 4%;
          }

          .logo-img {
            height: 65px;
          }

          .navbar.scrolled .logo-img {
            height: 55px;
          }

          .navbar.scrolled .nav-container {
            padding: 0.75rem 1.25rem;
          }

          .nav-links {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            height: 100dvh;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 6rem 2rem 3rem;
            gap: 2rem;
            clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
            transition: clip-path 0.4s ease-in-out;
            z-index: 999;
            overflow-y: auto;
            justify-content: flex-start;
          }
          
          .nav-links.active {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }

          .nav-links a:not(.btn) {
            font-size: 1.1rem;
          }

          .mobile-menu-btn {
            display: block;
            z-index: 1001;
          }

          .account-dropdown {
            width: 100%;
            justify-content: center;
          }

          .account-btn {
            display: none;
          }

          .account-dropdown-menu {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            box-shadow: none;
            background: transparent;
            border: none;
            width: 100%;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .account-dropdown-item {
            text-align: center;
            width: 100%;
            font-size: 1.1rem;
          }

          .account-dropdown-profil {
            padding-left: 1rem;
          }
        }
      `}</style>
    </nav>
  );
}
