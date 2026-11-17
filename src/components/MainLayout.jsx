'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthModal from './AuthModal';
import { supabase } from '@/utils/supabase';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setIsSidebarOpen(false); // Cierra el sidebar si se desloguea
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="app-layout">
      <AuthModal />
      {isMounted && session && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div className="main-content">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}
