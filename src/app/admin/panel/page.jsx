'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import styles from './admin.module.css';
import distritosPeru from '@/utils/ubigeo.json';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('proveedores');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de datos
  const [proveedores, setProveedores] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  
  // Estado para el modal de Crear Licitación
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estado para ver postulantes
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);

  // Estado para el modal de Expediente PDF
  const [expedienteModal, setExpedienteModal] = useState(null);

  const departamentos = Object.keys(distritosPeru);

  useEffect(() => {
    async function loadAdminData() {
      // 1. Verificación de Seguridad (Solo Compradores)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
        return;
      }
      
      const { data: compradorData } = await supabase
        .from('compradores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!compradorData) {
        alert("Acceso Restringido: No tienes privilegios de Compras SOLGAS.");
        window.location.href = '/mis-convocatorias'; // Lo botamos a su panel de proveedor
        return;
      }

      setUser(compradorData);

      // 2. Cargar Proveedores Registrados (Base de Datos SAP)
      const { data: dataProv } = await supabase.from('proveedores').select('*').order('created_at', { ascending: false });
      setProveedores(dataProv || []);

      // 3. Cargar Convocatorias Históricas con sus postulantes
      const { data: dataConv } = await supabase
        .from('convocatorias')
        .select(`
          *,
          postulaciones(
            id, estado, fecha_postulacion,
            proveedores(*)
          )
        `)
        .order('created_at', { ascending: false });
      setConvocatorias(dataConv || []);

      // 4. Cargar Postulaciones Recibidas
      const { data: dataPost } = await supabase
        .from('postulaciones')
        .select(`
          id, estado, fecha_postulacion,
          proveedores(ruc, razon_social, categoria),
          convocatorias(titulo, gerencia_solicitante)
        `)
        .order('fecha_postulacion', { ascending: false });
      setPostulaciones(dataPost || []);

      setLoading(false);
    }
    
    loadAdminData();
  }, []);

  // Función para homologar proveedor
  const toggleHomologacion = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const { error } = await supabase
      .from('proveedores')
      .update({ homologado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      // Actualizamos el estado local
      setProveedores(proveedores.map(p => p.id === id ? { ...p, homologado: nuevoEstado } : p));
    }
  };

  const cambiarEstadoPostulacion = async (postulacionId, nuevoEstado) => {
    const { error } = await supabase
      .from('postulaciones')
      .update({ estado: nuevoEstado })
      .eq('id', postulacionId);
      
    if (!error && selectedLicitacion) {
      // Actualizar estado local en el modal
      const actualizadas = selectedLicitacion.postulaciones.map(p => 
        p.id === postulacionId ? { ...p, estado: nuevoEstado } : p
      );
      setSelectedLicitacion({ ...selectedLicitacion, postulaciones: actualizadas });
      alert("Estado de evaluación actualizado a: " + nuevoEstado);
    } else {
      alert("Error al actualizar estado");
    }
  };

  const handleCrearLicitacion = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData(e.target);
    const dataObj = Object.fromEntries(formData.entries());

    // 1. Subir imagen si existe
    const file = formData.get('imagen');
    let publicUrl = null;

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('convocatorias') // Nombre del bucket en Supabase
        .upload(fileName, file);
      
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('convocatorias').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      } else {
        console.error("Error subiendo imagen:", uploadError);
      }
    }

    // 2. Insertar Licitación
    const { data, error } = await supabase.from('convocatorias').insert([{
      titulo: dataObj.titulo,
      gerencia_solicitante: dataObj.gerencia,
      presupuesto_referencial: dataObj.presupuesto || null,
      ubicacion: dataObj.ubicacion,
      requiere_homologacion: dataObj.homologacion === 'on',
      fecha_cierre: dataObj.fecha_cierre,
      imagen_url: publicUrl,
      estado: 'Abierto',
      creado_por: user.id
    }]).select();

    setUploading(false);

    if (!error && data) {
      setConvocatorias([data[0], ...convocatorias]);
      setShowModal(false);
      alert("¡Licitación publicada exitosamente!");
    } else {
      alert("Hubo un error al crear la licitación.");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div className={styles.loadingScreen}>Validando credenciales de Compras SOLGAS...</div>;
  }

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR DE COMPRAS */}
      <aside className={styles.sidebar}>
        <div className={styles.brandBox}>
          <h2 style={{margin:0, color:'var(--solgas-blue)'}}>SOLGAS</h2>
          <p style={{margin:0, fontSize:'12px', color:'#f97316', fontWeight:'bold'}}>PANEL DE COMPRAS</p>
        </div>
        
        <div className={styles.userProfile}>
          <div className={styles.avatar}>🛡️</div>
          <div>
            <h3 style={{margin: 0, fontSize: '14px', color: 'var(--text-main)'}}>{user?.nombre_completo || 'Administrador'}</h3>
            <p style={{margin: 0, fontSize: '11px', color: '#666'}}>{user?.email}</p>
          </div>
        </div>
        
        <nav className={styles.navMenu}>
          <button 
            className={`${styles.navItem} ${activeTab === 'proveedores' ? styles.active : ''}`}
            onClick={() => setActiveTab('proveedores')}
          >
            🏢 Gestión de Proveedores
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'convocatorias' ? styles.active : ''}`}
            onClick={() => setActiveTab('convocatorias')}
          >
            📢 Licitaciones (Publicadas)
          </button>
          <button className={styles.navItem} style={{color: 'red', marginTop: 'auto'}} onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}>
            🚪 Salir del Panel
          </button>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className={styles.mainContent}>
        
        {/* VISTA: PROVEEDORES */}
        {activeTab === 'proveedores' && (
          <section className={styles.sectionContainer}>
            <header className={styles.sectionHeader}>
              <div>
                <h2>Directorio de Proveedores MYPE</h2>
                <p>Todos los proveedores que han llenado exitosamente el Formulario SAP y están listos para ser evaluados.</p>
              </div>
              <div className={styles.statsBox}>
                <div className={styles.stat}>
                  <span>Total Registrados</span>
                  <strong>{proveedores.length}</strong>
                </div>
                <div className={styles.stat}>
                  <span>Homologados</span>
                  <strong style={{color:'green'}}>{proveedores.filter(p => p.homologado).length}</strong>
                </div>
              </div>
            </header>

            <div className={styles.tableCard}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>RUC / Razón Social</th>
                    <th>Categoría / Servicio</th>
                    <th>Ubicación</th>
                    <th>Homologación Oficial</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((prov) => (
                    <tr key={prov.id}>
                      <td>
                        <strong>{prov.ruc}</strong><br/>
                        <span style={{fontSize:'13px', color:'#4b5563'}}>{prov.razon_social}</span>
                      </td>
                      <td>
                        <span className={styles.categoryPill}>{prov.categoria}</span><br/>
                        <span style={{fontSize:'12px', color:'#6b7280'}}>{prov.tipo_servicio}</span>
                      </td>
                      <td>
                        {prov.departamento}<br/>
                        <span style={{fontSize:'12px', color:'#6b7280'}}>{prov.pais}</span>
                      </td>
                      <td>
                        <button 
                          className={`${styles.toggleBtn} ${prov.homologado ? styles.toggleOn : styles.toggleOff}`}
                          onClick={() => toggleHomologacion(prov.id, prov.homologado)}
                        >
                          {prov.homologado ? '✅ Homologado' : '❌ Pendiente'}
                        </button>
                      </td>
                      <td>
                        <button className={styles.btnOutline} onClick={() => setExpedienteModal(prov)}>
                          Ver Expediente PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {proveedores.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#6b7280'}}>
                        No hay proveedores registrados todavía en la base de datos SAP.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* VISTA: CONVOCATORIAS */}
        {activeTab === 'convocatorias' && (
          <section className={styles.sectionContainer}>
            <header className={styles.sectionHeader}>
              <div>
                <h2>Licitaciones Activas</h2>
                <p>Gestiona los servicios que SOLGAS está buscando en el mercado MYPE.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Crear Nueva Licitación
              </button>
            </header>

            <div className={styles.tableCard}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Título de la Licitación</th>
                    <th>Gerencia Solicitante</th>
                    <th>Presupuesto (Ref)</th>
                    <th>Vencimiento</th>
                    <th>Postulantes</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {convocatorias.map((conv) => (
                    <tr key={conv.id}>
                      <td style={{fontWeight:'bold', color:'var(--solgas-blue)'}}>{conv.titulo}</td>
                      <td>{conv.gerencia_solicitante}</td>
                      <td>{conv.presupuesto_referencial ? `$${Number(conv.presupuesto_referencial).toLocaleString()}` : 'Confidencial'}</td>
                      <td>{formatDate(conv.fecha_cierre)}</td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{padding: '6px 12px', fontSize: '12px'}}
                          onClick={() => setSelectedLicitacion(conv)}
                        >
                          👁️ Ver Postulantes ({conv.postulaciones?.length || 0})
                        </button>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${conv.estado === 'Abierto' ? styles.statusOpen : styles.statusClosed}`}>
                          {conv.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      {/* MODAL PARA CREAR LICITACIÓN */}
      {showModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}>
            <h2 style={{color: 'var(--solgas-blue)', marginTop: 0}}>Crear Nueva Licitación</h2>
            <form onSubmit={handleCrearLicitacion} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px'}}>
              
              <div>
                <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>Título de la Licitación</label>
                <input type="text" name="titulo" required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db'}} />
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>Gerencia Solicitante</label>
                  <select name="gerencia" required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db'}}>
                    <option value="Abastecimiento">Abastecimiento</option>
                    <option value="Gerencia de Operaciones">Gerencia de Operaciones</option>
                    <option value="Riesgo Operacional">Riesgo Operacional</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>Fecha de Cierre</label>
                  <input type="date" name="fecha_cierre" required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db'}} />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>Ubicación / Región</label>
                  <select name="ubicacion" required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db'}}>
                    <option value="Nacional">A Nivel Nacional</option>
                    {departamentos.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>Presupuesto Referencial ($)</label>
                  <input type="number" name="presupuesto" placeholder="Opcional" style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db'}} />
                </div>
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px'}}>
                <input type="checkbox" name="homologacion" id="homol" defaultChecked style={{width: '18px', height: '18px'}} />
                <label htmlFor="homol" style={{fontSize: '14px'}}>Exigir que el proveedor esté Homologado</label>
              </div>

              <div>
                <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>Foto de Portada (Opcional)</label>
                <input type="file" name="imagen" accept="image/*" style={{width: '100%', padding: '8px', border: '1px dashed #d1d5db', borderRadius: '6px', background: '#f9fafb'}} />
                <p style={{margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280'}}>Sube una imagen para que aparezca en la tarjeta de la página principal.</p>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb'}}>
                <button type="button" onClick={() => setShowModal(false)} style={{padding: '10px 20px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer'}}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={uploading} style={{padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer'}}>
                  {uploading ? 'Subiendo y Publicando...' : 'Publicar Convocatoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA VER POSTULANTES DE UNA LICITACIÓN */}
      {selectedLicitacion && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <div>
                <h2 style={{color: 'var(--solgas-blue)', margin: 0}}>Postulantes Registrados</h2>
                <p style={{margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px'}}>Licitación: {selectedLicitacion.titulo}</p>
              </div>
              <button onClick={() => setSelectedLicitacion(null)} style={{background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer'}}>✖</button>
            </div>
            
            <table className={styles.dataTable} style={{marginTop: '16px'}}>
              <thead>
                <tr>
                  <th>RUC / Empresa</th>
                  <th>Categoría</th>
                  <th>Fecha de Postulación</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {selectedLicitacion.postulaciones?.map(post => (
                  <tr key={post.id}>
                    <td>
                      <strong>{post.proveedores?.ruc}</strong><br/>
                      <span style={{fontSize: '13px', color: '#4b5563'}}>{post.proveedores?.razon_social}</span>
                      <br/>
                      <button 
                        onClick={() => setExpedienteModal(post.proveedores)}
                        style={{marginTop: '4px', background: 'transparent', border: '1px solid var(--solgas-blue)', color: 'var(--solgas-blue)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer'}}
                      >
                        📄 Ver Ficha SAP
                      </button>
                    </td>
                    <td><span className={styles.categoryPill}>{post.proveedores?.categoria}</span></td>
                    <td>{formatDate(post.fecha_postulacion)}</td>
                    <td><span className={`${styles.statusBadge} ${styles.statusOpen}`}>{post.estado}</span></td>
                    <td>
                      <select 
                        onChange={(e) => cambiarEstadoPostulacion(post.id, e.target.value)}
                        value={post.estado}
                        style={{padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d1d5db'}}
                      >
                        <option value="Postulado">Postulado</option>
                        <option value="En Evaluación">En Evaluación</option>
                        <option value="Pre-Seleccionado">Pre-Seleccionado</option>
                        <option value="Seleccionado Oficial">Seleccionado Oficial</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {(!selectedLicitacion.postulaciones || selectedLicitacion.postulaciones.length === 0) && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#6b7280'}}>
                      No hay postulantes registrados para esta licitación todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EXPEDIENTE PDF (FICHA DEL PROVEEDOR) */}
      {expedienteModal && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'}}>
          <div style={{background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto'}} id="imprimible">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid var(--solgas-blue)', paddingBottom: '16px'}}>
              <div>
                <h2 style={{color: 'var(--solgas-blue)', margin: 0}}>Ficha de Proveedor / Expediente SAP</h2>
                <p style={{margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px'}}>Documento Oficial - ImpulsaT Solgas</p>
              </div>
              <button onClick={() => setExpedienteModal(null)} style={{background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer'}}>✖</button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
              <div>
                <h3 style={{fontSize: '16px', color: 'var(--solgas-blue)', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>Datos Generales</h3>
                <p><strong>Razón Social:</strong> {expedienteModal.razon_social}</p>
                <p><strong>RUC:</strong> {expedienteModal.ruc}</p>
                <p><strong>Tipo Tercero:</strong> {expedienteModal.tipo_tercero}</p>
                <p><strong>Tamaño de Empresa:</strong> {expedienteModal.tamano_empresa}</p>
                <p><strong>Moneda de Pago:</strong> {expedienteModal.moneda_orden}</p>
              </div>
              <div>
                <h3 style={{fontSize: '16px', color: 'var(--solgas-blue)', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>Ubicación y Contacto</h3>
                <p><strong>Dirección:</strong> {expedienteModal.direccion_nombre}</p>
                <p><strong>Ubicación:</strong> {expedienteModal.distrito}, {expedienteModal.provincia}, {expedienteModal.departamento} - {expedienteModal.pais}</p>
                <p><strong>Gerente:</strong> {expedienteModal.gerente_nombre}</p>
                <p><strong>DNI Gerente:</strong> {expedienteModal.gerente_dni}</p>
              </div>
            </div>

            <div style={{marginTop: '24px'}}>
              <h3 style={{fontSize: '16px', color: 'var(--solgas-blue)', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>Cuenta Bancaria (Pagos)</h3>
              <p><strong>Banco:</strong> {expedienteModal.banco}</p>
              <p><strong>Cuenta:</strong> {expedienteModal.cuenta_bancaria}</p>
              <p><strong>CCI:</strong> {expedienteModal.cuenta_cci}</p>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb'}}>
              <button type="button" onClick={() => window.print()} className="btn btn-primary" style={{padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', background: '#FF6B00', border: 'none', color: 'white', fontWeight: 'bold'}}>
                🖨️ Imprimir PDF / Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
