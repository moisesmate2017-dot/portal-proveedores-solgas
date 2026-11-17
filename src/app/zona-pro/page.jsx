'use client';
import { useState } from 'react';
import styles from './zona-pro.module.css';

export default function ZonaPro() {
  const [activeFaq, setActiveFaq] = useState(1);

  const faqs = [
    {
      id: 1,
      q: '¿Cómo evalúa Solgas mis propuestas?',
      a: 'Nuestra evaluación se divide estrictamente en 3 pilares según nuestro manual de adquisiciones: 50% Evaluación Técnica, 35% Evaluación Económica, y 15% Evaluación de Riesgo Operacional (HSE) para servicios críticos.'
    },
    {
      id: 2,
      q: '¿Qué es el SCTR y por qué lo exigen?',
      a: 'El Seguro Complementario de Trabajo de Riesgo (SCTR) garantiza cobertura de salud y pensión ante accidentes. Es obligatorio para todo personal contratista que realice tareas operativas dentro de nuestras plantas (Callao, Trujillo, etc.).'
    },
    {
      id: 3,
      q: '¿Qué es el Pasaporte de Seguridad?',
      a: 'Es un certificado emitido tras aprobar nuestra inducción en Seguridad y Medio Ambiente. Valida que el personal conoce los riesgos y protocolos (como trabajos en altura o en caliente) y tiene vigencia de un año.'
    },
    {
      id: 4,
      q: '¿Cuáles son los estados de mi servicio y pago?',
      a: 'Tu servicio pasará por 4 etapas en el portal: 1) POSTULADO (en evaluación), 2) ADJUDICADO (ganador de la licitación), 3) EN SERVICIO (ejecución con orden de compra), y 4) PAGO (culminado con hoja de entrada).'
    }
  ];

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>ZONA PRO</span>
          <h1 className={styles.title}>Centro de Formación para Proveedores</h1>
          <p className={styles.subtitle}>Conoce los protocolos, normativas de homologación y reglas de oro de Seguridad (HSE) para operar con éxito en las instalaciones de Solgas.</p>
        </div>
      </div>

      <div className={styles.container}>
        <section className={styles.section}>
          <h2>Cápsulas Didácticas de Seguridad (HSE)</h2>
          <div className={styles.videoGrid}>
            <div className={styles.videoCard}>
              <div className={styles.videoThumbnail}>
                <span className={styles.playIcon}>▶</span>
              </div>
              <h3>01. El Proceso de Homologación</h3>
              <p>Requisitos de la Debida Diligencia para ser un proveedor apto.</p>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoThumbnail}>
                <span className={styles.playIcon}>▶</span>
              </div>
              <h3>02. Reglas Generales en Planta</h3>
              <p>Conoce los EPPs obligatorios, normas de tránsito y conducta.</p>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoThumbnail}>
                <span className={styles.playIcon}>▶</span>
              </div>
              <h3>03. Permisos de Trabajo de Alto Riesgo</h3>
              <p>Gestión de trabajos en altura, caliente y espacios confinados.</p>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2>Dudas y Respuestas Frecuentes</h2>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`${styles.faqItem} ${activeFaq === faq.id ? styles.active : ''}`}
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
              >
                <div className={styles.faqQuestion}>
                  {faq.q}
                  <span className={styles.arrow}>▼</span>
                </div>
                <div className={styles.faqAnswer}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
