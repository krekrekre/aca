'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const images = ['/hero-1.jpg', '/hero-2.jpg'];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="hero-bg">
        <div className="mobile-bg"></div>
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      <div className="hero-container">
        <div className={`hero-content ${mounted ? 'active' : ''}`}>
          <div className="badge">Vrhunska Nega</div>
          <h1>Klasičan stil za<br /> <span className="italic">modernog muškarca.</span></h1>
          <p className="hero-subtitle">
            Doživite umetnost tradicionalnog berberstva sa savremenom oštrinom u prijatnom ambijentu.
          </p>
          <div className="hero-actions">
            <a href="/book" className="btn btn-primary">Zakaži Odmah</a>
            <a href="#usluge" className="btn btn-text">Naše Usluge</a>
          </div>
        </div>

        <div className={`hero-image-wrapper ${mounted ? 'active' : ''}`}>
          <div className="image-stack">
            {images.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt={`Hero ${idx + 1}`}
                className={`hero-image ${currentImage === idx ? 'visible' : ''}`}
              />
            ))}
          </div>
          <div className="image-accent"></div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 0 5%;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
          background: transparent;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.12;
          z-index: 2;
        }

        .mobile-bg {
          display: none;
        }

        .glow-1 {
          width: 55vw;
          height: 55vw;
          background: var(--accent);
          top: -15%;
          right: -10%;
          animation: float 10s ease-in-out infinite alternate;
        }

        .glow-2 {
          width: 45vw;
          height: 45vw;
          background: #3a3a3a;
          bottom: -15%;
          left: -15%;
          animation: float 12s ease-in-out infinite alternate-reverse;
        }

        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(20px) scale(1.05); }
        }

        .hero-container {
          width: 100%;
          max-width: 1400px;
          display: flex;
          align-items: center;
          gap: 4rem;
          z-index: 1;
        }

        .hero-content {
          flex: 1.2;
          max-width: 700px;
          padding-top: 2rem;
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .hero-content.active {
          opacity: 1;
          transform: translateX(0);
        }

        .badge {
          display: inline-block;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: var(--accent);
          margin-bottom: 2rem;
          padding-left: 3.5rem;
          position: relative;
          font-weight: 500;
        }

        .badge::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 2.5rem;
          height: 1px;
          background: var(--accent);
        }

        h1 {
          font-size: clamp(3.5rem, 7vw, 6.5rem);
          margin-bottom: 2rem;
          line-height: 1.05;
          font-weight: 300;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .italic {
          font-style: italic;
          color: var(--accent);
          font-family: var(--font-serif);
          font-weight: 400;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 3.5rem;
          max-width: 500px;
          line-height: 1.8;
          font-weight: 300;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .hero-actions {
          display: flex;
          gap: 2.5rem;
          align-items: center;
        }

        .hero-image-wrapper {
          flex: 0.8;
          height: 75vh;
          position: relative;
          opacity: 0;
          transform: scale(0.95) translateX(30px);
          transition: opacity 1.5s ease 0.2s, transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s;
        }

        .hero-image-wrapper.active {
          opacity: 1;
          transform: scale(1) translateX(0);
        }

        .image-stack {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 2;
          overflow: hidden;
          border-radius: var(--radius-lg);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .hero-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 2s ease-in-out, transform 8s linear;
          transform: scale(1.15);
        }

        .hero-image.visible {
          opacity: 1;
          transform: scale(1);
        }

        .image-accent {
          position: absolute;
          top: 2rem;
          right: -2rem;
          bottom: -2rem;
          left: 2rem;
          border: 1px solid var(--accent);
          opacity: 0.4;
          z-index: 1;
          border-radius: var(--radius-lg);
          transition: opacity 0.3s ease;
        }

        .hero-image-wrapper:hover .image-accent {
          opacity: 0.8;
        }

        @media (max-width: 1100px) {
          .hero-container {
            gap: 2rem;
          }
          h1 {
            font-size: clamp(3rem, 6vw, 4.5rem);
          }
        }

        @media (max-width: 1024px) {
          .hero {
            padding-top: 140px;
            padding-bottom: 60px;
            min-height: auto;
            margin-top: 0;
            background-image: linear-gradient(
              to bottom,
              rgba(13, 13, 13, 0.9) 0%,
              rgba(13, 13, 13, 0.3) 50%,
              rgba(13, 13, 13, 0.9) 100%
            ), url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            background-attachment: scroll;
          }

          .hero-bg {
            display: none;
          }

          .mobile-bg {
            display: none;
          }
          .hero-container {
            flex-direction: column;
            text-align: center;
          }
          
          .badge {
            padding-left: 0;
          }
          .badge::before {
            display: none;
          }

          .hero-content {
            padding-top: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translateY(30px);
          }

          .hero-content.active {
            transform: translateY(0);
          }

          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
            margin-bottom: 4rem;
          }

          .hero-image-wrapper {
            display: none;
          }

          .image-accent {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding-top: 130px;
            padding-bottom: 40px;
            margin-top: 0;
          }

          .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 2.5rem;
          }

          .hero-actions {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
            align-items: center;
          }

          .hero-actions .btn {
            width: 100%;
            text-align: center;
            justify-content: center;
          }

          .hero-image-wrapper {
            height: 40vh;
          }
        }
      `}</style>
    </section>
  );
}
