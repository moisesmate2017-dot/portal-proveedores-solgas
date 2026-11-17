'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import styles from './dashboard.module.css';
import Link from 'next/link';

export default function MisConvocatorias() {
  const [activeTab, setActiveTab] = useState('postulaciones');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de datos
  const [postulaciones, setPostulaciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
        return;
      }

      // Seguridad: Si es un perfil de Compras, no tiene nada que hacer en el panel de proveedor
      const { data: esComprador } = await supabase.from('compradores').select('id').eq('id', user.id).single();
      if (esComprador) {
        window.location.href = '/admin/panel';
        return;
      }

      setUser(user);

      // Cargar Postulaciones
      const { data: dataPostulaciones } = await supabase
        .from('postulaciones')
        .select(`
          id, estado, fecha_postulacion,
          convocatorias ( titulo, gerencia_solicitante, fecha_cierre, estado )
        `)
        .eq('proveedor_id', user.id);
      
      setPostulaciones(dataPostulaciones || []);

      // Cargar Favoritos
      const { data: dataFavoritos } = await supabase
        .from('favoritos')
        .select(`
          id, created_at,
          convocatorias ( id, titulo, gerencia_solicitante, fecha_cierre, estado )
        `)
        .eq('proveedor_id', user.id);

      setFavoritos(dataFavoritos || []);
      setLoading(false);
    }
    
    loadDashboardData();
  }, []);

  const eliminarFavorito = async (idFavorito) => {
    await supabase.from('favoritos').delete().eq('id', idFavorito);
    setFavoritos(favoritos.filter(f => f.id !== idFavorito));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Cargando tu Panel B2B...</div>;
  }

  return (
    <div className={styles.dashboardLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>👤</div>
          <div>
            <h3 style={{margin: 0, fontSize: '16px', color: 'var(--solgas-blue)'}}>Proveedor</h3>
            <p style={{margin: 0, fontSize: '12px', color: '#666'}}>{user?.email}</p>
          </div>
        </div>
        
        <nav className={styles.navMenu}>
          <button 
            className={`${styles.navItem} ${activeTab === 'postulaciones' ? styles.active : ''}`}
            onClick={() => setActiveTab('postulaciones')}
          >
            📋 Mis Postulaciones
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'favoritos' ? styles.active : ''}`}
            onClick={() => setActiveTab('favoritos')}
          >
            ⭐ Mis Favoritos
          </button>
          <Link href="/registro-sap" className={styles.navItem}>
            ⚙️ Mi Expediente SAP
          </Link>
          <button className={styles.navItem} style={{color: 'red', marginTop: 'auto'}} onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}>
            🚪 Cerrar Sesión
          </button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className={styles.mainContent}>
        
        {/* VISTA POSTULACIONES */}
        {activeTab === 'postulaciones' && (
          <section className={styles.panelSection}>
            <h2>Mis Postulaciones Activas</h2>
            <p className={styles.subtitle}>Sigue el estado de las licitaciones a las que has enviado tu propuesta.</p>
            
            {postulaciones.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aún no has postulado a ninguna convocatoria.</p>
                <Link href="/" className="btn btn-primary" style={{marginTop: '16px'}}>Explorar Convocatorias</Link>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Convocatoria</th>
                      <th>Gerencia</th>
                      <th>Fecha Postulación</th>
                      <th>Cierre de Licitación</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postulaciones.map((post) => (
                      <tr key={post.id}>
                        <td style={{fontWeight: 'bold', color: 'var(--solgas-blue)'}}>{post.convocatorias.titulo}</td>
                        <td>{post.convocatorias.gerencia_solicitante}</td>
                        <td>{formatDate(post.fecha_postulacion)}</td>
                        <td>{formatDate(post.convocatorias.fecha_cierre)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[post.estado.toLowerCase()] || styles.default}`}>
                            {post.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* VISTA FAVORITOS */}
        {activeTab === 'favoritos' && (
          <section className={styles.panelSection}>
            <h2>Convocatorias Guardadas</h2>
            <p className={styles.subtitle}>Estas son las licitaciones que marcaste para revisar más tarde.</p>
            
            {favoritos.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No tienes convocatorias guardadas en favoritos.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {favoritos.map((fav) => (
                  <div key={fav.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardLabel}>{fav.convocatorias.gerencia_solicitante}</span>
                      <button className={styles.btnRemove} onClick={() => eliminarFavorito(fav.id)}>❌</button>
                    </div>
                    <h3>{fav.convocatorias.titulo}</h3>
                    <div className={styles.cardFooter}>
                      <span>Cierra el: {formatDate(fav.convocatorias.fecha_cierre)}</span>
                      <button className="btn btn-primary" style={{padding: '8px 16px'}}>Postular</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
