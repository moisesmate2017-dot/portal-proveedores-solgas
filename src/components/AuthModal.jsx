'use client';
import { useState, useEffect } from 'react';
import styles from './AuthModal.module.css';
import { supabase } from '@/utils/supabase';

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true);
      setErrorMsg('');
      if (e.detail && e.detail.mode === 'register') {
        setIsLogin(false);
      } else {
        setIsLogin(true);
      }
    };
    
    window.addEventListener('open-auth-modal', handleOpen);
    return () => window.removeEventListener('open-auth-modal', handleOpen);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setErrorMsg('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else {
        const userId = data.user.id;
        
        // 1. Verificar si pertenece al perfil "Compras"
        const { data: comprador } = await supabase
          .from('compradores')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (comprador) {
          alert('Bienvenido al Panel de Compras SOLGAS');
          setIsOpen(false);
          window.location.href = '/admin/panel';
          return;
        }

        // 2. Verificar si es un Proveedor con Expediente SAP terminado
        const { data: proveedor } = await supabase
          .from('proveedores')
          .select('id')
          .eq('id', userId)
          .single();

        setIsOpen(false);
        if (proveedor) {
          alert('Bienvenido a tu panel de proveedor IMPÚLSA-T');
          window.location.href = '/mis-convocatorias';
        } else {
          alert('Debes completar tu Registro SAP obligatorio antes de postular.');
          window.location.href = '/registro-sap';
        }
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            ruc: formData.ruc,
            razon_social: formData.razonSocial,
            homologado: false,
            capacitado_hse: false
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        alert('Cuenta creada exitosamente. Por favor, completa tu Expediente SAP por única vez.');
        setIsOpen(false);
        window.location.href = '/registro-sap';
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
        
        <div className={styles.header}>
          <h2>{isLogin ? 'Ingresa a IMPÚLSA-T' : 'Regístrate como Proveedor'}</h2>
          <p>{isLogin ? 'Gestiona tus postulaciones y notificaciones' : 'Únete a la red de proveedores de Solgas'}</p>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`} onClick={() => { setIsLogin(true); setErrorMsg(''); }}>Iniciar Sesión</button>
          <button className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`} onClick={() => { setIsLogin(false); setErrorMsg(''); }}>Registrarme</button>
        </div>

        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className={styles.inputGroup}>
                <label>RUC de la Empresa</label>
                <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} placeholder="Ej. 20123456789" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Razón Social</label>
                <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} placeholder="Nombre de la empresa según SUNAT" required />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>Correo Electrónico</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@empresa.com" required />
          </div>

          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength="6" />
          </div>

          {!isLogin && (
            <div className={styles.checkboxGroup}>
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Acepto los Términos de Uso y declaro estar dispuesto a cumplir con los <strong>procesos de Homologación y Seguridad (HSE)</strong> exigidos por SOLGAS.
              </label>
            </div>
          )}

          <button type="submit" className={`${styles.submitBtn} btn btn-primary`} disabled={loading}>
            {loading ? 'Procesando...' : (isLogin ? 'Ingresar a mi cuenta' : 'Crear cuenta y Postular')}
          </button>
          
          <div className={styles.footerNote}>
            {!isLogin && "Al registrarte, tu información será almacenada. Podrás postular a las licitaciones y nuestro equipo de Compras evaluará y actualizará tu estado de Homologación internamente."}
          </div>
        </form>
      </div>
    </div>
  );
}
