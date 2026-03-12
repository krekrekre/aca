'use client';

import { Instagram, Facebook, MapPin, Phone, Mail, Scissors } from 'lucide-react';
import Link from 'next/link';
import { BRAND_CONFIG } from '@/config/brand';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link href="/#hero" className="footer-logo">
              <img src={BRAND_CONFIG.logoPath} alt={BRAND_CONFIG.name} className="footer-logo-img" />
            </Link>
            <p className="footer-tagline">
              {BRAND_CONFIG.tagline}
            </p>
            <div className="social-links">
              <a href={BRAND_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon">
                <Instagram size={20} />
              </a>
              <a href={BRAND_CONFIG.facebookUrl} aria-label="Facebook" className="social-icon">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3>Navigacija</h3>
            <div className="links-grid">
              <Link href="/#usluge" className="nav-link">Usluge</Link>
              <Link href="/#o-nama" className="nav-link">O Nama</Link>
              <Link href="/#lokacija" className="nav-link">Lokacija</Link>
              <Link href="/book" className="nav-link">Zakaži Termin</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h3>Kontakt</h3>
            <div className="contact-list">
              <div className="contact-item">
                <MapPin size={18} className="contact-icon" />
                <span>{BRAND_CONFIG.fullAddress}</span>
              </div>
              <div className="contact-item">
                <Phone size={18} className="contact-icon" />
                <span>{BRAND_CONFIG.phone}</span>
              </div>
              <div className="contact-item">
                <Mail size={18} className="contact-icon" />
                <span>{BRAND_CONFIG.email}</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="footer-hours">
            <h3>Radno Vreme</h3>
            <div className="hours-list">
              <div className="hours-row">
                <span>Pon - Pet:</span>
                <span>{BRAND_CONFIG.workingHours.weekdays}</span>
              </div>
              <div className="hours-row">
                <span>Subota:</span>
                <span>{BRAND_CONFIG.workingHours.saturday}</span>
              </div>
              <div className="hours-row">
                <span>Nedelja:</span>
                <span className="closed">{BRAND_CONFIG.workingHours.sunday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} {BRAND_CONFIG.name}. Sva prava zadržana.</p>
          <div className="bottom-links">
            <a href="#" className="nav-link">Politika Privatnosti</a>
            <a href="#" className="nav-link">Uslovi Korišćenja</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background-color: transparent;
          padding: 8rem 5% 4rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 6rem;
        }

        .footer-logo {
          display: inline-block;
          margin-bottom: 2rem;
          transition: var(--transition);
        }

        .footer-logo:hover {
          opacity: 0.8;
          transform: scale(1.02);
        }

        .footer-logo-img {
          height: 60px;
          width: auto;
          object-fit: contain;
        }

        .footer-tagline {
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 2.5rem;
          font-size: 1rem;
          max-width: 320px;
        }

        .social-links {
          display: flex;
          gap: 1.25rem;
        }

        .social-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: var(--transition);
        }

        .social-icon:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(212, 175, 55, 0.05);
          transform: translateY(-3px);
        }

        h3 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          color: var(--text-primary);
          letter-spacing: 0.05em;
          position: relative;
        }

        h3::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -12px;
          width: 30px;
          height: 2px;
          background: var(--accent);
        }

        .links-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .links-grid a {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .contact-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .hours-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .hours-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
          font-size: 0.95rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 0.75rem;
        }

        .closed {
          color: #ff6b6b;
          font-weight: 500;
        }

        .footer-bottom {
          padding-top: 3rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .bottom-links {
          display: flex;
          gap: 2.5rem;
        }

        .bottom-links a {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        @media (max-width: 1100px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
        }

        @media (max-width: 600px) {
          .footer {
            padding: 4rem 5% 3rem;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          h3 {
            text-align: start;
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          h3::after {
            left: 0;
            transform: none;
          }
          
          .footer-brand {
            text-align: start;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-tagline {
            text-align: start;
            max-width: 100%;
          }

          .social-links {
            justify-content: flex-start;
          }

          .links-grid {
            align-items: flex-start;
          }

          .contact-item {
            justify-content: flex-start;
          }

          .hours-row {
            max-width: 100%;
            margin: 0;
            width: 100%;
          }
          
          .footer-bottom {
            flex-direction: column;
            gap: 1.5rem;
            text-align: start;
            align-items: flex-start;
          }

          .bottom-links {
            justify-content: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
