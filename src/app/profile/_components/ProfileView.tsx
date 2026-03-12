'use client';

import { User, Calendar, History, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CancelButton from './CancelButton';
import EditProfile from './EditProfile';
import Navbar from '@/components/layout/Navbar';

interface ProfileViewProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
  };
  upcoming: any[];
  past: any[];
}

export default function ProfileView({ user, upcoming, past }: ProfileViewProps) {
  return (
    <main className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        {/* Header Section */}
        <header className="profile-header">
          <div className="user-info-main">
            <div className="avatar-large">
              <User size={40} strokeWidth={1.5} />
            </div>
            <div className="user-meta">
              <h1>{user.name}</h1>
              <p className="user-email">{user.email}</p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className="badge-role">{user.role}</span>
                {user.phone && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• {user.phone}</span>}
              </div>
            </div>
          </div>
          <Link href="/book" className="btn btn-primary">
            Zakaži Novi Termin
          </Link>
        </header>

        <div className="profile-grid">
          {/* Main Content: Appointments */}
          <div className="appointments-section">
            <section className="appointment-group">
              <div className="group-header">
                <Calendar size={20} className="group-icon" />
                <h2>Predstojeći Termini</h2>
              </div>
              
              <div className="appointment-list">
                {upcoming.length === 0 ? (
                  <div className="empty-state">
                    <p>Trenutno nemate zakazanih termina.</p>
                    <Link href="/book" className="btn-text">Pronađite slobodan termin &rarr;</Link>
                  </div>
                ) : (
                  upcoming.map(apt => (
                    <div key={apt.id} className="appointment-card upcoming">
                      <div className="card-top">
                        <div className="service-info">
                          <h3>{apt.isPause ? 'PAUZA' : apt.service?.title || 'Brica usluga'}</h3>
                          <p>Berber: <strong>{apt.employee.name}</strong></p>
                        </div>
                        <div className="price-tag">{apt.isPause ? '0' : (apt.service?.price ? Math.round(apt.service.price) : '1500')} RSD</div>
                      </div>
                      <div className="card-bottom">
                        <div className="time-info">
                          <span className="date">
                            {new Date(apt.startTime).toLocaleDateString('sr-RS', { 
                              weekday: 'short', month: 'long', day: 'numeric' 
                            })}
                          </span>
                          <span className="time">
                            {new Date(apt.startTime).toLocaleTimeString('sr-RS', { 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <CancelButton id={apt.id} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="appointment-group past-appointments">
              <div className="group-header">
                <History size={20} className="group-icon" />
                <h2>Istorija i Otkazani Termini</h2>
              </div>
              
              <div className="appointment-list">
                {past.length === 0 ? (
                  <div className="empty-state simple">
                    <p>Nema istorije termina.</p>
                  </div>
                ) : (
                  past.reverse().map(apt => (
                    <div key={apt.id} className="appointment-card past">
                      <div className="past-info">
                        <h3>{apt.isPause ? 'PAUZA' : apt.service?.title || 'Brica usluga'}</h3>
                        <p>{new Date(apt.startTime).toLocaleDateString('sr-RS', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className={`status-pill ${apt.status.toLowerCase()}`}>
                        {apt.status === "CANCELLED" ? "Otkazano" : "Završeno"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area (Account Summary etc) */}
          <aside className="profile-sidebar">
             <div className="sidebar-card account-card">
                <EditProfile 
                  initialName={user.name || ''} 
                  initialEmail={user.email || ''} 
                  initialPhone={user.phone || ''} 
                />
                <h3>Informacije o Nalogu</h3>
                <div className="info-row">
                  <span className="label">Ime</span>
                  <span className="value">{user.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email</span>
                  <span className="value">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="info-row">
                    <span className="label">Telefon</span>
                    <span className="value">{user.phone}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Status</span>
                  <span className="value">{user.role === 'ADMIN' ? 'Administrator' : 'Klijent'}</span>
                </div>
             </div>
             
             <div className="sidebar-help">
               <p>Imate pitanje o svom terminu?</p>
               <Link href="/#lokacija" className="sidebar-link">Kontaktirajte nas &rarr;</Link>
             </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-primary);
          padding-top: 100px; /* Offset for fixed navbar */
        }

        .profile-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 5%;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .user-info-main {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          position: relative;
        }

        .user-meta h1 {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          margin-bottom: 0.25rem;
        }

        .user-email {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
        }

        .badge-role {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.25rem 0.75rem;
          background: rgba(212, 175, 55, 0.1);
          color: var(--accent);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 99px;
          font-weight: 500;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 4rem;
        }

        .group-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .group-icon {
          color: var(--accent);
        }

        .group-header h2 {
          font-size: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .appointment-list {
          display: grid;
          gap: 1.25rem;
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          background: rgba(255,255,255,0.01);
          border: 1px dashed var(--border);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
        }

        .empty-state.simple {
           padding: 1.5rem;
           text-align: left;
           border-style: solid;
        }

        /* Upcoming Card */
        .appointment-card.upcoming {
          background: linear-gradient(145deg, var(--surface) 0%, rgba(25, 25, 25, 0.5) 100%);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: var(--radius-lg);
          padding: 2rem;
          transition: border-color 0.3s ease;
        }

        .appointment-card.upcoming:hover {
          border-color: var(--accent);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 1.5rem;
        }

        .service-info h3 {
          font-size: 1.4rem;
          margin-bottom: 0.5rem;
        }

        .service-info p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .price-tag {
          font-family: var(--font-serif);
          color: var(--accent);
          font-size: 1.2rem;
          font-weight: 500;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .time-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .time-info .date {
          font-weight: 500;
          font-size: 1rem;
        }

        .time-info .time {
          color: var(--accent);
          font-weight: 600;
        }

        /* Past Appointments */
        .past-appointments {
          margin-top: 4rem;
        }

        .appointment-card.past {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .appointment-card.past:hover {
          opacity: 1;
        }

        .past-info h3 {
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }

        .past-info p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .status-pill {
          font-size: 0.75rem;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
        }

        .status-pill.cancelled {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.05);
        }

        /* Sidebar Styles */
        .sidebar-card {
           background: var(--surface);
           border: 1px solid var(--border);
           border-radius: var(--radius-lg);
           padding: 2rem;
           margin-bottom: 2rem;
           position: relative;
        }

        .sidebar-card h3 {
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          color: var(--accent);
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1.25rem;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-row .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .info-row .value {
          font-size: 1rem;
          color: var(--text-primary);
        }

        .sidebar-help {
           padding: 0 1rem;
        }

        .sidebar-help p {
           color: var(--text-secondary);
           font-size: 0.9rem;
           margin-bottom: 0.5rem;
        }

        .sidebar-link {
          font-size: 0.9rem;
          color: var(--accent);
          transition: var(--transition);
        }

        .sidebar-link:hover {
          padding-left: 5px;
        }

        @media (max-width: 968px) {
          .profile-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2rem;
          }
          
          .profile-sidebar {
            order: -1;
          }
        }

        @media (max-width: 480px) {
          .profile-page {
            padding-top: 80px;
          }

          .profile-container {
            padding: 1.5rem 4%;
          }

          .profile-header {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
          }

          .user-info-main {
            gap: 1rem;
          }

          .avatar-large {
            width: 56px;
            height: 56px;
          }

          .user-meta h1 {
            font-size: 1.5rem;
          }

          .user-email {
            font-size: 0.85rem;
          }

          .group-header h2 {
            font-size: 1rem;
          }

          .appointment-card.upcoming {
            padding: 1.25rem;
          }

          .card-top {
            flex-direction: column;
            gap: 0.75rem;
          }

          .service-info h3 {
            font-size: 1.15rem;
          }

          .card-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .sidebar-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
