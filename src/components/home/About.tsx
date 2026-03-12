'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BRAND_CONFIG } from '@/config/brand';

export default function About() {
  return (
    <section id="o-nama" className="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="image-wrapper">
            <Image
              src="/about-new.jpg"
              alt="O Nama"
              fill
              className="about-image"
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="content-wrapper">
            <h2 className="section-title">O Nama</h2>
            <div className="title-underline"></div>
            <p className="description">
              Dobrodošli u {BRAND_CONFIG.name}, mesto gde se tradicija brijača spaja sa modernim stilom i vrhunskom uslugom. 
              Naš tim posvećenih profesionalaca tu je da vam pruži ne samo savršenu frizuru i negovanu bradu, već i iskustvo 
              koje ćete pamtiti.
            </p>
            <p className="description">
              Verujemo da je svaki detalj važan. Od oštrih linija do opuštajuće atmosfere, naš cilj je da svaki klijent 
              izađe iz našeg salona sa osećajem samopouzdanja i svežine. Dozvolite nam da brinemo o vašem izgledu.
            </p>
            <Link href="/book" className="btn btn-primary mt-6">
              Zakaži Termin
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: 8rem 5%;
          background-color: transparent;
          position: relative;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          background-color: var(--bg-secondary);
        }

        .image-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          pointer-events: none;
          z-index: 10;
        }

        .about-image {
          object-fit: cover !important;
          transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .image-wrapper:hover .about-image {
          transform: scale(1.08);
        }

        .content-wrapper {
          padding-right: 2rem;
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
          margin-bottom: 2.5rem;
        }

        .description {
          color: var(--text-secondary);
          line-height: 1.9;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          font-weight: 300;
        }

        .mt-6 {
          margin-top: 2rem;
        }

        @media (max-width: 968px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 4rem;
          }

          .content-wrapper {
            padding-right: 0;
            text-align: start;
            order: 1;
          }

          .title-underline {
            margin: 0 0 2.5rem 0;
          }

          .image-wrapper {
            aspect-ratio: 1 / 1;
            max-width: 100%;
            order: 2;
            margin-bottom: 2rem;
          }
        }

        @media (max-width: 480px) {
          .about-section {
            padding: 4rem 5%;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .description {
            font-size: 1rem;
          }

          .image-wrapper {
            aspect-ratio: 4 / 3;
          }
        }
      `}</style>
    </section>
  );
}
