'use client';

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BRAND_CONFIG } from '@/config/brand';

export default function Location() {
  return (
    <section id="lokacija" className="location-section">
      <div className="container">
        <div className="header-text">
          <h2 className="section-title">Pronađite Nas</h2>
          <div className="title-underline"></div>
        </div>
        
        <div className="location-grid">
          <div className="map-container">
            <iframe
              src={BRAND_CONFIG.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokacija Radnje"
            ></iframe>
          </div>

          <div className="info-container">
            <div className="info-card">
              <div className="info-item">
                <div className="icon-wrapper">
                  <MapPin size={24} />
                </div>
                <div className="info-text">
                  <h3>Lokacija</h3>
                  <p>{BRAND_CONFIG.address}</p>
                  <p>{BRAND_CONFIG.city}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-wrapper">
                  <Phone size={24} />
                </div>
                <div className="info-text">
                  <h3>Kontakt</h3>
                  <p>{BRAND_CONFIG.phone}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-wrapper">
                  <Mail size={24} />
                </div>
                <div className="info-text">
                  <h3>Email</h3>
                  <p>{BRAND_CONFIG.email}</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-wrapper">
                  <Clock size={24} />
                </div>
                <div className="info-text">
                  <h3>Radno Vreme</h3>
                  <p>Pon - Pet: {BRAND_CONFIG.workingHours.weekdays}</p>
                  <p>Subota: {BRAND_CONFIG.workingHours.saturday}</p>
                  <p>Nedelja: {BRAND_CONFIG.workingHours.sunday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .location-section {
          padding: 8rem 5%;
          background-color: transparent;
          position: relative;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-text {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-title {
          font-family: var(--font-serif);
          font-size: 3.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .title-underline {
          width: 80px;
          height: 3px;
          background-color: var(--accent);
          margin: 0 auto;
        }

        .location-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 4rem;
          align-items: stretch;
        }

        .map-container {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          min-height: 450px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .map-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .info-card {
          background: linear-gradient(145deg, var(--surface) 0%, rgba(20,20,20,0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          padding: 3rem 2.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .icon-wrapper {
          color: var(--accent);
          background: rgba(212, 175, 55, 0.08);
          padding: 1rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 175, 55, 0.2);
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .info-item:hover .icon-wrapper {
          transform: translateY(-3px);
          background: rgba(212, 175, 55, 0.15);
        }

        .info-text h3 {
          font-family: var(--font-sans);
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }

        .info-text p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 1rem;
          font-weight: 300;
        }

        @media (max-width: 1024px) {
          .location-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .map-container {
            height: 400px;
          }
        }

        @media (max-width: 480px) {
          .location-section {
            padding: 4rem 5%;
          }

          .header-text {
            margin-bottom: 3rem;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .map-container {
            height: 280px;
            min-height: 280px;
          }

          .info-card {
            padding: 2rem 1.5rem;
            gap: 2rem;
          }

          .info-text h3 {
            font-size: 0.95rem;
          }

          .info-text p {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}
