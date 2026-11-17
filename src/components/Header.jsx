'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { supabase } from '@/utils/supabase';

export default function Header({ onMenuClick }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleNavClick = (tabName) => {
    if (window.location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('change-tab', { detail: tabName }));
    } else {
      window.location.href = `/?tab=${tabName}`;
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {session && (
          <button className={styles.menuBtn} onClick={onMenuClick}>
            ☰
          </button>
        )}
        <span className={styles.mobileLogo}>
          IMPÚLSA-<span style={{color: '#FF6B00'}}>T</span>
        </span>
      </div>

      <nav className={styles.topNav}>
        <a style={{cursor: 'pointer'}} onClick={() => handleNavClick('convocatorias')} className={styles.navLink}>Convocatorias</a>
        <a style={{cursor: 'pointer'}} onClick={() => handleNavClick('instructivos')} className={styles.navLink}>Instructivos</a>
        <a style={{cursor: 'pointer'}} onClick={() => handleNavClick('faq')} className={styles.navLink}>Preguntas Frecuentes</a>
      </nav>
      
      <div className={styles.actions}>
        {session ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <span style={{fontSize: '14px', fontWeight: '600', color: 'var(--solgas-blue)'}}>
              {session.user.user_metadata?.razon_social || session.user.email}
            </span>
            <button 
              className={styles.btnLogin}
              onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <>
            <button 
              className={styles.btnPrimary} 
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'register' } }))}
            >
              Quiero ser proveedor SOLGAS
            </button>
            <button 
              className={styles.btnLogin}
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }))}
            >
              <span className={styles.icon}>👤</span> Log In
            </button>
          </>
        )}
      </div>
    </header>
  );
}
