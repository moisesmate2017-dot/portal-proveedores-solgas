'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { supabase } from '@/utils/supabase';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [session, setSession] = useState(null);

  const [esComprador, setEsComprador] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('compradores').select('id').eq('id', session.user.id).single()
          .then(({ data }) => setEsComprador(!!data));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase.from('compradores').select('id').eq('id', session.user.id).single()
          .then(({ data }) => setEsComprador(!!data));
      } else {
        setEsComprador(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)}></div>}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logoContainer} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 12px'}}>
          <span style={{color: 'white', fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px'}}>
            IMPÚLSA-<span style={{color: '#FF6B00'}}>T</span>
          </span>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navItem} ${styles.active}`} onClick={() => setIsOpen(false)}>
            <span className={styles.icon}>🏠</span>
            <span>Inicio / Explorar</span>
          </Link>
          
          {session && esComprador && (
            <>
              <Link href="/admin/panel" className={styles.navItem} onClick={() => setIsOpen(false)}>
                <span className={styles.icon}>🛡️</span>
                <span>Ir al Panel de Compras</span>
              </Link>
            </>
          )}

          {session && !esComprador && (
            <>
              <Link href="/mis-convocatorias" className={styles.navItem} onClick={() => setIsOpen(false)}>
                <span className={styles.icon}>📋</span>
                <span>Mi Bandeja B2B</span>
              </Link>
              <Link href="/registro-sap" className={styles.navItem} onClick={() => setIsOpen(false)}>
                <span className={styles.icon}>⚙️</span>
                <span>Mi Expediente SAP</span>
              </Link>
            </>
          )}
        </nav>
        
        {session && (
          <div className={styles.bottomNav}>
            <button className={styles.navItem} style={{color: '#f87171', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer'}} onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}>
              <span className={styles.icon}>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
