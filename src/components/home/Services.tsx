'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

const services = [
  {
    title: "Klasično Šišanje",
    desc: "Precizno šišanje prilagođeno obliku vaše glave, završeno brijanjem vrata britvom.",
    img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800",
    price: "Od 1.500 RSD"
  },
  {
    title: "Sređivanje Brade",
    desc: "Detaljno oblikovanje koje naglašava strukturu vašeg lica uz tretman premium uljem.",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
    price: "Od 1.000 RSD"
  },
  {
    title: "Brijanje Vrelim Peškirom",
    desc: "Tradicionalno opuštanje uz toplu penu i hiruršku preciznost prave britve.",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
    price: "Od 1.200 RSD"
  }
];

export default function Services() {
  return (
    <section id="usluge" className="services">
      <div className="section-header">
        <span className="subtitle">Premium Usluge</span>
        <h2>Majstorski Izvedeno</h2>
        <div className="divider"></div>
      </div>

      <div className="services-grid">
        {services.map((svc, i) => (
          <div key={i} className="service-card" style={{ '--delay': i } as any}>
            <div className="card-image">
              <img src={svc.img} alt={svc.title} />
              <div className="card-number">0{i + 1}</div>
            </div>
            <div className="card-content">
              <div className="card-type">BARBERSHOP</div>
              <h3>{svc.title}</h3>
              <p>{svc.desc}</p>
              <div className="card-footer">
                <span className="price">{svc.price}</span>
                <Link href="/book" className="card-link">
                  <span>Rezerviši</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .services {
          padding: 10rem 5%;
          max-width: 1400px;
          margin: 0 auto;
          background: transparent;
        }

        .section-header {
          text-align: center;
          margin-bottom: 6rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .subtitle {
          color: var(--accent);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-weight: 600;
          display: block;
        }

        .section-header h2 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
        }

        .divider {
          width: 60px;
          height: 2px;
          background: linear-gradient(to right, transparent, var(--accent), transparent);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
          gap: 4rem;
        }

        .service-card {
          position: relative;
          background: var(--surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .service-card:hover {
          border-color: rgba(211, 140, 65, 0.3);
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4);
        }

        .service-card:hover .price,
        .service-card:hover .card-link {
          color: var(--accent);
        }

        .service-card:hover .card-link svg {
          transform: translateX(5px);
        }

        .card-image {
          height: 300px;
          overflow: hidden;
          position: relative;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
          filter: grayscale(20%) brightness(0.9);
        }

        .service-card:hover .card-image img {
          transform: scale(1.1);
          filter: grayscale(0%) brightness(1);
        }

        .card-number {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          font-size: 3rem;
          font-weight: 900;
          color: white;
          opacity: 0.1;
          font-family: 'Playfair Display', serif;
          line-height: 1;
        }

        .card-content {
          padding: 2.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.2));
        }

        .card-type {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: var(--accent);
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        .card-content h3 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-content p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.8;
          font-size: 1.05rem;
          font-weight: 300;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .price {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }

        .card-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s ease;
        }

        .card-link svg {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .card-link:hover {
          color: var(--accent);
        }

        @media (max-width: 768px) {
          .services {
            padding: 6rem 5%;
          }
          
          .section-header {
            margin-bottom: 3.5rem;
          }

          .services-grid {
            gap: 2.5rem;
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .services {
            padding: 4rem 5%;
          }

          .card-image {
            height: 220px;
          }

          .card-content {
            padding: 1.5rem;
          }

          .card-content h3 {
            font-size: 1.4rem;
          }

          .card-content p {
            font-size: 0.95rem;
            margin-bottom: 1.25rem;
          }

          .card-footer {
            flex-direction: row;
            padding-top: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
