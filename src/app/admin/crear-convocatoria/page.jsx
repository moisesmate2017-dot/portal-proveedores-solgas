'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function CrearConvocatoria() {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Nueva Convocatoria (Vista Compras)</h1>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles.btnOutline}`}>Guardar Borrador</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>Publicar Convocatoria</button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.mainColumn}>
          {/* Portada de la convocatoria */}
          <div className={styles.card}>
            <h2>1. Imagen de Portada</h2>
            <p className={styles.helpText}>Esta imagen representará la licitación y aparecerá en el portal público que ven los proveedores.</p>
            
            <div className={styles.uploadArea} onClick={() => document.getElementById('imageInput').click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className={styles.previewImage} />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span className={styles.uploadIcon}>📸</span>
                  <p>Arrastra una imagen o <strong>haz clic para explorar</strong></p>
                  <span className={styles.uploadHint}>Recomendado: Alta calidad (JPG, PNG). Se redimensionará automáticamente.</span>
                </div>
              )}
              <input 
                id="imageInput" 
                type="file" 
                accept="image/*" 
                className={styles.hiddenInput} 
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Detalles Básicos */}
          <div className={styles.card}>
            <h2>2. Detalles de la Convocatoria</h2>
            <div className={styles.formGroup}>
              <label>Título de la Convocatoria</label>
              <input type="text" placeholder="Ej. Mantenimiento de Válvulas Q3" className={styles.input} />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Categoría</label>
                <select className={styles.input}>
                  <option>Mantenimiento</option>
                  <option>Logística</option>
                  <option>Suministros</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Planta / Sede</label>
                <select className={styles.input}>
                  <option>Planta Callao</option>
                  <option>Planta Trujillo</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Descripción y Requisitos</label>
              <textarea placeholder="Detalla los alcances del servicio..." className={styles.textarea} rows={4}></textarea>
            </div>
          </div>

          {/* Form Builder (Google Forms Style) */}
          <div className={styles.card}>
            <h2>3. Constructor de Formulario (Cuestionario al Proveedor)</h2>
            <p className={styles.helpText}>Diseña qué preguntas o documentos deben subir los proveedores al postular (Estilo Google Forms).</p>
            
            <div className={styles.questionBlock}>
              <div className={styles.questionHeader}>
                <input type="text" value="¿Cuenta con certificación SCTR vigente?" className={styles.questionTitleInput} readOnly/>
                <select className={styles.questionTypeSelect}>
                  <option>Opción Múltiple</option>
                  <option>Archivo Adjunto</option>
                  <option>Texto Breve</option>
                </select>
              </div>
              <div className={styles.questionBody}>
                <div className={styles.optionRow}>
                  <input type="radio" disabled /> <span>Sí</span>
                </div>
                <div className={styles.optionRow}>
                  <input type="radio" disabled /> <span>No</span>
                </div>
              </div>
            </div>

            <div className={styles.questionBlock}>
              <div className={styles.questionHeader}>
                <input type="text" value="Adjunte certificado bancario (PDF)" className={styles.questionTitleInput} readOnly/>
                <select className={styles.questionTypeSelect} defaultValue="Archivo Adjunto">
                  <option>Opción Múltiple</option>
                  <option value="Archivo Adjunto">Archivo Adjunto (Sube PDF)</option>
                  <option>Texto Breve</option>
                </select>
              </div>
            </div>

            <button className={styles.addQuestionBtn}>+ Añadir Nueva Pregunta / Requisito</button>
          </div>

        </div>

        <div className={styles.sideColumn}>
          {/* Panel de Configuración lateral */}
          <div className={styles.card}>
            <h3>Configuración de Cierre</h3>
            <div className={styles.formGroup}>
              <label>Fecha Límite</label>
              <input type="date" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Presupuesto Referencial</label>
              <input type="text" placeholder="Ej. $15,000" className={styles.input} />
            </div>
            
            <hr className={styles.divider} />
            
            <h3>Notificaciones de Alerta</h3>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              Enviar alerta push a proveedores
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              Cerrar automáticamente al asignar
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
