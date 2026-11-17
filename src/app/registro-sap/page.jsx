'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './registro-sap.module.css';
import distritosPeru from '../../utils/ubigeo.json';
import { supabase } from '@/utils/supabase';

export default function RegistroSAP() {
  const [loading, setLoading] = useState(false);
  const [cuentas, setCuentas] = useState([{ id: 1 }]);
  const [pais, setPais] = useState('Perú');
  const [departamento, setDepartamento] = useState('');
  
  // Estado para el usuario autenticado
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Bloqueo de Seguridad para Compradores
        const { data: esComprador } = await supabase.from('compradores').select('id').eq('id', user.id).single();
        if (esComprador) {
          window.location.href = '/admin/panel';
          return;
        }
        setUser(user);
      }
    }
    getUser();
  }, []);

  const agregarCuenta = () => {
    if (cuentas.length < 4) {
      setCuentas([...cuentas, { id: cuentas.length + 1 }]);
    } else {
      alert("Solo se permite un máximo de 4 cuentas bancarias por proveedor.");
    }
  };

  const eliminarCuenta = (id) => {
    setCuentas(cuentas.filter(c => c.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Debes iniciar sesión para guardar tu expediente SAP.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.target);
    const dataObj = Object.fromEntries(formData.entries());

    // 1. Recolectar Contactos en JSONB
    const contactos = {
      legal: {
        nombre: dataObj.legal_nombre,
        cargo: dataObj.legal_cargo,
        email: dataObj.legal_email,
        celular: `${dataObj.legal_cel_pais} ${dataObj.legal_cel_cod} ${dataObj.legal_cel_num}`
      },
      comercial: {
        nombre: dataObj.comercial_nombre,
        cargo: dataObj.comercial_cargo,
        email: dataObj.comercial_email,
        celular: `${dataObj.comercial_cel_pais} ${dataObj.comercial_cel_cod} ${dataObj.comercial_cel_num}`
      },
      administrativo: {
        nombre: dataObj.admin_nombre,
        cargo: dataObj.admin_cargo,
        email: dataObj.admin_email,
        celular: `${dataObj.admin_cel_pais} ${dataObj.admin_cel_cod} ${dataObj.admin_cel_num}`
      }
    };

    // 2. Recolectar Cuentas Bancarias en JSONB
    const cuentasBancariasArr = cuentas.map((c, i) => ({
      banco: formData.get(`cuenta_${i}_banco`),
      numero: formData.get(`cuenta_${i}_numero`),
      cci: formData.get(`cuenta_${i}_cci`),
      tipo: formData.get(`cuenta_${i}_tipo`),
      moneda: formData.get(`cuenta_${i}_moneda`)
    }));

    // 3. Insertar a Supabase en la tabla `proveedores`
    const { error } = await supabase.from('proveedores').insert([{
      id: user.id, // Referencia al ID de Auth
      ruc: dataObj.ruc,
      razon_social: dataObj.razon_social,
      tipo_tercero: dataObj.tipo_tercero,
      tamano_empresa: dataObj.tamano_empresa,
      tipo_servicio: dataObj.tipo_servicio,
      categoria: dataObj.categoria,
      direccion_tipo_via: dataObj.direccion_tipo_via,
      direccion_nombre: dataObj.direccion_nombre,
      codigo_postal: dataObj.codigo_postal,
      pais: dataObj.pais === 'Otro' ? dataObj.pais_especifico : 'Perú',
      departamento: dataObj.pais === 'Otro' ? dataObj.departamento_especifico : departamento,
      distrito: dataObj.distrito,
      contactos: contactos,
      cuentas_bancarias: cuentasBancariasArr,
      cuenta_detraccion: {
        banco: dataObj.detraccion_banco,
        numero: dataObj.detraccion_numero,
        codigo: dataObj.detraccion_codigo,
        moneda: dataObj.detraccion_moneda
      },
      tiene_banco_intermediario: dataObj.banco_intermediario === 'SI',
      sujeto_retencion_fiscal: dataObj.retencion_fiscal === 'SI'
    }]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert(`Error al guardar: ${error.message}`);
    } else {
      alert('¡Expediente SAP guardado con éxito en la Base de Datos! Ya puedes postular a las convocatorias.');
      window.location.href = '/mis-convocatorias';
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.headerBox}>
        <div className={styles.container}>
          <h1>Formulario de Creación de Proveedores (SAP)</h1>
          <p>Registro obligatorio con información comercial, de contacto y financiera para iniciar operaciones con Solgas.</p>
        </div>
      </div>

      <div className={styles.container}>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          
          {/* ================= DATOS GENERALES ================= */}
          <section className={styles.formSection}>
            <h2>1. Datos Generales de la Empresa</h2>
            
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Razón Social / Nombre</label>
                <input type="text" name="razon_social" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Tipo de Tercero</label>
                <select name="tipo_tercero" required>
                  <option value="">Seleccione...</option>
                  <option value="Persona Natural">Proveedor Persona Natural</option>
                  <option value="Persona Jurídica">Proveedor Persona Jurídica</option>
                  <option value="Extranjero">Proveedor del Exterior (ND)</option>
                  <option value="Acreedor Empleado">Acreedor Empleado (Caja Chica)</option>
                </select>
              </div>
              
              <div className={styles.inputGroup}>
                <label>RUC / CIF / VAT del Tercero</label>
                <input type="text" name="ruc" pattern="[0-9]{11}" maxLength="11" title="El RUC debe tener 11 dígitos numéricos" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Tamaño de empresa</label>
                <select name="tamano_empresa" required>
                  <option value="">Seleccione...</option>
                  <option value="Micro empresa">Micro empresa</option>
                  <option value="Pequeña empresa">Pequeña empresa</option>
                  <option value="Mediana empresa">Mediana empresa</option>
                  <option value="Gran empresa">Gran empresa</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Tipo de Servicio</label>
                <select name="tipo_servicio" required>
                  <option value="">Seleccione...</option>
                  <option value="Bienes y Materiales">Bienes y Materiales</option>
                  <option value="Obras y Construcción">Obras y Construcción</option>
                  <option value="Servicios Técnicos / Consultoría">Servicios Técnicos / Consultoría</option>
                  <option value="Logística y Transporte">Logística y Transporte</option>
                  <option value="Servicios Generales">Servicios Generales</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Categoría</label>
                <select name="categoria" required>
                  <option value="">Seleccione...</option>
                  <option value="Suministro">Suministro</option>
                  <option value="Operador Logístico">Operador Logístico</option>
                  <option value="Construcción">Construcción</option>
                  <option value="Mantenimiento B2B">Mantenimiento B2B</option>
                  <option value="Proyectos B2B">Proyectos B2B</option>
                  <option value="Mantenimiento Plantas">Mantenimiento Plantas</option>
                  <option value="Intermediación Laboral">Intermediación Laboral</option>
                  <option value="Servicios Generales">Servicios Generales</option>
                  <option value="Servicios Inhouse">Servicios Inhouse</option>
                  <option value="Transporte personal">Transporte personal</option>
                  <option value="Alquiler equipos">Alquiler equipos</option>
                </select>
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.inputGroup}>
                <label>Tipo de Vía/Dirección</label>
                <select name="direccion_tipo_via" required>
                  <option value="">Seleccione...</option>
                  <option value="Calle">Calle</option>
                  <option value="Avenida">Avenida</option>
                  <option value="Jiron">Jiron</option>
                  <option value="Plaza">Plaza</option>
                  <option value="Acceso">Acceso</option>
                  <option value="Alameda">Alameda</option>
                  <option value="Autopista">Autopista</option>
                  <option value="Autovia">Autovia</option>
                  <option value="Boulevar">Boulevar</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Nombre de dirección</label>
                <input type="text" name="direccion_nombre" placeholder="Ej. Los Rosales 123" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Código Postal</label>
                <input type="text" name="codigo_postal" required />
              </div>

              <div className={styles.inputGroup}>
                <label>País / Región</label>
                <select name="pais" value={pais} onChange={(e) => setPais(e.target.value)} required>
                  <option value="Perú">Perú</option>
                  <option value="Otro">Otro País / Extranjero</option>
                </select>
                {pais === 'Otro' && (
                  <input 
                    type="text" 
                    name="pais_especifico"
                    placeholder="Escriba el nombre del país" 
                    style={{marginTop: '8px'}} 
                    required 
                  />
                )}
              </div>
              <div className={styles.inputGroup}>
                <label>{pais === 'Perú' ? 'Departamento' : 'Estado / Región'}</label>
                {pais === 'Perú' ? (
                  <select name="departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required>
                    <option value="">Seleccione Departamento...</option>
                    {Object.keys(distritosPeru).map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" name="departamento_especifico" placeholder="Ingrese Estado o Provincia" required />
                )}
              </div>
              <div className={styles.inputGroup}>
                <label>{pais === 'Perú' ? 'Distrito' : 'Ciudad / Distrito'}</label>
                {(pais === 'Perú' && distritosPeru[departamento]) ? (
                  <select name="distrito" required>
                    <option value="">Seleccione Distrito...</option>
                    {distritosPeru[departamento].map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" name="distrito" placeholder={pais === 'Perú' ? "Escriba su distrito" : "Ingrese ciudad"} required />
                )}
              </div>
            </div>
          </section>

          {/* ================= PERSONAS DE CONTACTO ================= */}
          <section className={styles.formSection}>
            <h2>2. Personas de Contacto</h2>

            {/* Representante Legal */}
            <div className={styles.contactBlock}>
              <h3>* Representante Legal</h3>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}><label>Nombre Completo</label><input type="text" name="legal_nombre" required /></div>
                <div className={styles.inputGroup}><label>Cargo</label><input type="text" name="legal_cargo" required /></div>
                <div className={styles.inputGroup}><label>Correo Electrónico</label><input type="email" name="legal_email" required /></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px'}}>
                <div>
                  <label style={{fontSize:'13px', fontWeight: 'bold', color:'var(--text-main)'}}>Celular (Obligatorio)</label>
                  <div className={styles.grid4} style={{marginTop: '8px'}}>
                    <div className={styles.inputGroup}><input type="text" name="legal_cel_pais" placeholder="País" pattern="[0-9+]*" required /></div>
                    <div className={styles.inputGroup}><input type="text" name="legal_cel_cod" placeholder="Código" pattern="[0-9]*" required /></div>
                    <div className={styles.inputGroup} style={{gridColumn: 'span 2'}}><input type="text" name="legal_cel_num" placeholder="Número" pattern="[0-9]*" title="Solo números" required /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto Comercial */}
            <div className={styles.contactBlock}>
              <h3>* Contacto Comercial</h3>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}><label>Nombre Completo</label><input type="text" name="comercial_nombre" required /></div>
                <div className={styles.inputGroup}><label>Cargo</label><input type="text" name="comercial_cargo" required /></div>
                <div className={styles.inputGroup}><label>Correo Electrónico</label><input type="email" name="comercial_email" required /></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px'}}>
                <div>
                  <label style={{fontSize:'13px', fontWeight: 'bold', color:'var(--text-main)'}}>Celular (Obligatorio)</label>
                  <div className={styles.grid4} style={{marginTop: '8px'}}>
                    <div className={styles.inputGroup}><input type="text" name="comercial_cel_pais" placeholder="País" pattern="[0-9+]*" required /></div>
                    <div className={styles.inputGroup}><input type="text" name="comercial_cel_cod" placeholder="Código" pattern="[0-9]*" required /></div>
                    <div className={styles.inputGroup} style={{gridColumn: 'span 2'}}><input type="text" name="comercial_cel_num" placeholder="Número" pattern="[0-9]*" title="Solo números" required /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto Administrativo */}
            <div className={styles.contactBlock}>
              <h3>* Contacto Administrativo</h3>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}><label>Nombre Completo</label><input type="text" name="admin_nombre" required /></div>
                <div className={styles.inputGroup}><label>Cargo</label><input type="text" name="admin_cargo" required /></div>
                <div className={styles.inputGroup}><label>Correo Electrónico</label><input type="email" name="admin_email" required /></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px'}}>
                <div>
                  <label style={{fontSize:'13px', fontWeight: 'bold', color:'var(--text-main)'}}>Celular (Obligatorio)</label>
                  <div className={styles.grid4} style={{marginTop: '8px'}}>
                    <div className={styles.inputGroup}><input type="text" name="admin_cel_pais" placeholder="País" pattern="[0-9+]*" required /></div>
                    <div className={styles.inputGroup}><input type="text" name="admin_cel_cod" placeholder="Código" pattern="[0-9]*" required /></div>
                    <div className={styles.inputGroup} style={{gridColumn: 'span 2'}}><input type="text" name="admin_cel_num" placeholder="Número" pattern="[0-9]*" title="Solo números" required /></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= FINANCIERA ================= */}
          <section className={styles.formSection}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h2 style={{margin: 0}}>3. Información Financiera</h2>
              <button 
                type="button" 
                onClick={agregarCuenta} 
                className={styles.btnAdd}
              >
                + Añadir otra cuenta bancaria
              </button>
            </div>
            
            {cuentas.map((cuenta, index) => (
              <div key={cuenta.id} className={styles.contactBlock} style={{position: 'relative'}}>
                {cuentas.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => eliminarCuenta(cuenta.id)} 
                    style={{position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold'}}
                  >
                    X Eliminar
                  </button>
                )}
                <h3>Cuentas Bancarias {index + 1}</h3>
                <div className={styles.grid3}>
                  <div className={styles.inputGroup}><label>Banco</label><input type="text" name={`cuenta_${index}_banco`} required /></div>
                  <div className={styles.inputGroup}><label>N° de Cuenta</label><input type="text" name={`cuenta_${index}_numero`} pattern="[0-9-]*" required /></div>
                  <div className={styles.inputGroup}><label>CCI (20 Dígitos)</label><input type="text" name={`cuenta_${index}_cci`} pattern="[0-9]{20}" maxLength="20" title="Debe contener 20 dígitos" required /></div>
                  
                  <div className={styles.inputGroup}>
                    <label>Tipo de Cuenta</label>
                    <select name={`cuenta_${index}_tipo`} required>
                      <option value="Ahorros">Ahorros</option>
                      <option value="Corriente">Corriente</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Moneda</label>
                    <select name={`cuenta_${index}_moneda`} required>
                      <option value="PEN">Soles</option>
                      <option value="USD">Dólares</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.contactBlock}>
              <h3>Cuenta de Detracción</h3>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}><label>Banco</label><input type="text" name="detraccion_banco" defaultValue="Banco de la Nación" /></div>
                <div className={styles.inputGroup}><label>N° de Cuenta</label><input type="text" name="detraccion_numero" pattern="[0-9-]*" /></div>
                <div className={styles.inputGroup}><label>Cód. de Detracción</label><input type="text" name="detraccion_codigo" /></div>
                <div className={styles.inputGroup}>
                  <label>Moneda</label>
                  <select name="detraccion_moneda"><option value="PEN">Soles</option></select>
                </div>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>¿Existe banco corresponsal o intermediario?</label>
                <select name="banco_intermediario"><option value="NO">NO</option><option value="SI">SI</option></select>
              </div>
              <div className={styles.inputGroup}>
                <label>¿Está sujeto a retención fiscal?</label>
                <select name="retencion_fiscal"><option value="NO">NO</option><option value="SI">SI</option></select>
              </div>
            </div>

          </section>

          <div className={styles.actions}>
            <Link href="/" className={styles.btnSecondary}>Cancelar</Link>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Procesando y Guardando en Base de Datos...' : 'Firmar y Enviar Registro SAP'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
