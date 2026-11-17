'use client';
import { useState, useMemo } from 'react';
import styles from './page.module.css';

export default function Home() {
  // Top Notice Bar State
  const [noticeVisible, setNoticeVisible] = useState(true);

  // Homologation Checklist Interactive State (5 items)
  const [checklist, setChecklist] = useState({
    ruc: false,
    cci: false,
    ficha: false,
    portfolio: false,
    seguridad: false,
  });

  // MÓDULO DE CONSULTAS Y OPERACIONES (BENCHMARK ARCA CONTINENTAL & NESTLÉ)
  // Estado activo: 'facturacion', 'pagos', 'detracciones', 'conformidad'
  const [activeConsultationId, setActiveConsultationId] = useState('facturacion');

  // Training / Downloads Tab
  const [activeCapTab, setActiveCapTab] = useState('documentos');

  // FAQ Accordion State & Search
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState(1);

  // Email Copy State Tooltip
  const [copiedEmail, setCopiedEmail] = useState('');

  // Modals State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [videoModal, setVideoModal] = useState(null);

  // Registration Form State
  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    contacto: '',
    email: '',
    telefono: '',
    tipo: 'Servicios',
    categoria: 'Mantenimiento Industrial',
    departamento: 'Lima',
    mensaje: ''
  });

  // Copy helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(''), 2500);
  };

  // Checklist toggle
  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistCount = useMemo(() => {
    return Object.values(checklist).filter(Boolean).length;
  }, [checklist]);

  const checklistProgress = (checklistCount / 5) * 100;

  // Handle Form Submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const ticketId = `SOLGAS-${Math.floor(100000 + Math.random() * 900000)}`;
    setRegisterSuccess(ticketId);
  };

  // DATOS DE LAS 4 ÁREAS DEL MÓDULO DE CONSULTAS Y OPERACIONES
  const consultationsData = {
    facturacion: {
      id: 'facturacion',
      icon: '📄',
      title: 'Envío y Recepción de Facturas Electrónicas',
      hint: 'Par digital (.XML y .PDF), Orden de Compra y fechas de corte.',
      keyAlert: '⚠️ Fecha límite mensual: Día 25 a las 18:00 hrs',
      steps: [
        {
          title: 'Casilla Contable Oficial Designada',
          desc: 'Envía tus comprobantes únicamente a facturacion.proveedores@solgas.pe. Los envíos a correos personales de usuarios internos o compradores no ingresan al flujo de pago sistematizado de SAP.'
        },
        {
          title: 'Par Digital Obligatorio (.XML y .PDF)',
          desc: 'Todo correo debe adjuntar obligatoriamente el archivo .XML emitido ante SUNAT y su representación gráfica en .PDF. Ambos deben coincidir al milímetro en importes, moneda y conceptos.'
        },
        {
          title: 'Glosa Obligatoria con N° de Orden de Compra (OC)',
          desc: 'En el cuerpo o descripción de la factura electrónica debes consignar obligatoriamente el número de Orden de Compra (código de 10 dígitos) o Pedido de Servicio formalmente liberado.'
        },
        {
          title: 'Asunto Estandarizado de Correo',
          desc: 'Utiliza el formato oficial de asunto: [RUC PROVEEDOR] - [N° DE FACTURA] - [N° ORDEN DE COMPRA SOLGAS]. Ejemplo: 20512345678 - F001-0004521 - OC 4500148566.'
        }
      ],
      troubleshoot: [
        {
          q: '¿Por qué mi factura no aparece registrada en el sistema?',
          a: 'Verifica si incluiste el número de Orden de Compra en el XML y si enviaste ambos archivos (.XML y .PDF). Si enviaste después del día 25, entrará al ciclo contable del mes siguiente.'
        },
        {
          q: '¿Qué hago si mi factura fue rechazada u observada?',
          a: 'Revisa el motivo de observación enviado por contabilidad, subsana el documento (o emite Nota de Crédito según corresponda) y reenvíalo a la casilla oficial citando la observación resuelta.'
        },
        {
          q: '¿Puedo enviar varias facturas en un solo correo?',
          a: 'Se recomienda enviar un correo por cada factura con su respectivo XML, PDF y OC para garantizar un procesamiento ágil e independiente.'
        }
      ],
      actionBtnText: 'Copiar casilla de facturación',
      actionBtnValue: 'facturacion.proveedores@solgas.pe'
    },
    pagos: {
      id: 'pagos',
      icon: '💳',
      title: 'Días y Modalidad de Pago a Proveedores',
      hint: 'Calendario de transferencias CCI semanales y plazos de abono.',
      keyAlert: '📅 Días de Abono: Jueves y Viernes de cada semana',
      steps: [
        {
          title: 'Modalidad de Abono Interbancario (CCI)',
          desc: 'Los pagos se realizan exclusivamente mediante transferencia bancaria a la cuenta y Código de Cuenta Interbancario (CCI) formalmente declarados en tu expediente de proveedor.'
        },
        {
          title: 'Días de Pago de Tesorería Semanales',
          desc: 'Nuestra Tesorería ejecuta los pagos semanales todos los días Jueves y Viernes. Las transferencias entre bancos distintos pueden reflejarse hasta en 24 horas hábiles.'
        },
        {
          title: 'Cómputo de Plazos Contractuales',
          desc: 'Los plazos habituales (30, 45 o 60 días) se contabilizan estrictamente a partir de la fecha en que la factura es aprobada y aceptada por el área contable y el usuario técnico.'
        },
        {
          title: 'Constancia de Transferencia Bancaria',
          desc: 'Una vez procesado el abono, el sistema de tesorería remite automáticamente la constancia bancaria de liquidación al correo registrado en tu ficha de proveedor.'
        }
      ],
      troubleshoot: [
        {
          q: '¿Por qué cumplió la fecha de vencimiento y no he recibido el pago?',
          a: 'Comprueba con tu contacto de Solgas si la HES (Hoja de Entrada de Servicios) fue liberada oportunamente. Si la factura no cuenta con aprobación formal previa, no ingresa al lote de pago.'
        },
        {
          q: '¿Qué ocurre si el día de pago cae feriado?',
          a: 'Si el Jueves o Viernes programado coincide con un feriado nacional, Tesorería procesa las transferencias el día hábil inmediato anterior.'
        },
        {
          q: '¿Cómo reportar un cambio en mi número de cuenta o banco?',
          a: 'Descarga la Plantilla de Registro y Cuentas CCI desde la sección de Descargas, complétala con carta bancaria adjunta y remítela a abastecimiento@solgas.pe antes del cierre mensual.'
        }
      ],
      actionBtnText: 'Consultar estado a Tesorería',
      actionBtnValue: 'pagosproveedores@solgas.pe'
    },
    detracciones: {
      id: 'detracciones',
      icon: '🏛️',
      title: 'Detracciones y Retenciones (SUNAT)',
      hint: 'Agente de retención del 3% y depósitos SPOT Banco de la Nación.',
      keyAlert: '🏛️ Solgas es Agente de Retención del 3% del IGV',
      steps: [
        {
          title: 'Cuenta Corriente en el Banco de la Nación',
          desc: 'Todo proveedor que preste servicios sujetos al SPOT (Sistema de Pago de Obligaciones Tributarias) debe consignar visiblemente en la factura su número de cuenta de detracción del Banco de la Nación.'
        },
        {
          title: 'Porcentajes de Detracción Aplicables',
          desc: 'Aplicación estricta de las tasas fijadas por SUNAT: 12% para intermediación laboral, tercerización y mantenimiento, y 10% para demás servicios empresariales que superen los S/ 700.00.'
        },
        {
          title: 'Depósito SPOT por parte de Solgas',
          desc: 'Solgas efectúa el depósito de detracción en el Banco de la Nación dentro de los plazos establecidos por el calendario fiscal de SUNAT y pone a disposición la constancia de depósito.'
        },
        {
          title: 'Emisión de Comprobantes de Retención Electrónica (CRE)',
          desc: 'Al ser Agente de Retención, Solgas retiene el 3% del importe total a comprobantes no afectos a detracción superiores a S/ 700.00, emitiendo el respectivo comprobante electrónico.'
        }
      ],
      troubleshoot: [
        {
          q: '¿Dónde descargo mi Comprobante de Retención Electrónica?',
          a: 'Puedes descargarlo directamente ingresando con tu Clave SOL al portal de SUNAT (Menú: Empresas > Comprobantes de Pago > Retención Electrónica) o solicitándolo a pagosproveedores@solgas.pe.'
        },
        {
          q: '¿Qué hago si mi empresa es Agente de Retención o Buen Contribuyente?',
          a: 'Debes adjuntar la Resolución de SUNAT vigente que te acredita como tal al momento de enviar tu factura para que no se te aplique la retención del 3%.'
        },
        {
          q: '¿Cómo me envían la constancia de pago de detracción?',
          a: 'La constancia de detracción emitida por el Banco de la Nación se genera en lote y es enviada automáticamente por correo electrónico a tu casilla registrada durante los primeros 5 días hábiles del mes siguiente.'
        }
      ],
      actionBtnText: 'Solicitar constancia tributaria',
      actionBtnValue: 'pagosproveedores@solgas.pe'
    },
    conformidad: {
      id: 'conformidad',
      icon: '✅',
      title: 'Criterios para Aprobación de Facturas (Conformidad Previa)',
      hint: 'Requisitos indispensables: HES para servicios y Guía sellada para bienes.',
      keyAlert: '🛑 REGLA DE ORO: No emitir factura sin conformidad formal previa',
      steps: [
        {
          title: 'Para Prestación de Servicios: Hoja de Entrada (HES)',
          desc: 'Antes de emitir y enviar tu comprobante, el área usuaria solicitante de Solgas debe generar y liberar en el sistema SAP la Hoja de Entrada de Servicios (HES) que valida que el trabajo fue culminado a satisfacción.'
        },
        {
          title: 'Para Suministro de Bienes: Guía de Remisión Sellada',
          desc: 'Para entrega de materiales, repuestos o cilindros, el comprobante debe respaldarse en la Guía de Remisión debidamente sellada y firmada por el encargado del Almacén Solgas en planta.'
        },
        {
          title: 'Coincidencia Exacta con la Orden de Compra',
          desc: 'El valor monetario, moneda (Soles o Dólares), descripción de partidas y cantidades deben coincidir exactamente con los términos aprobados en la Orden de Compra liberada.'
        },
        {
          title: 'Prohibición de Servicios sin Orden de Compra',
          desc: 'Está estrictamente prohibido ejecutar servicios o despachar materiales sin contar previamente con el documento oficial de Orden de Compra generado en el sistema de Solgas.'
        }
      ],
      troubleshoot: [
        {
          q: '¿Quién es responsable de liberarme la HES?',
          a: 'El usuario técnico o supervisor de Solgas que coordinó el servicio en planta o campo es el encargado de generar la conformidad técnica (HES) en SAP.'
        },
        {
          q: '¿Qué ocurre si la factura tiene un monto diferente a la OC?',
          a: 'El sistema rechazará el comprobante automáticamente. Si hubo trabajos adicionales, el usuario interno de Solgas debe tramitar una ampliación formal de la Orden de Compra antes de que emitas la factura.'
        },
        {
          q: '¿Cuánto tiempo tiene el área usuaria para emitir la conformidad?',
          a: 'Una vez presentado el informe técnico de culminación de servicio, el área usuaria cuenta con un plazo habitual de 3 a 5 días hábiles para validar y liberar la HES.'
        }
      ],
      actionBtnText: 'Consultar a Mesa de Ayuda',
      actionBtnValue: 'abastecimiento@solgas.pe'
    }
  };

  const currentConsultation = consultationsData[activeConsultationId];

  // FAQs Data
  const faqs = [
    {
      id: 1,
      category: 'facturacion',
      q: '¿Qué debo hacer si mi factura fue rechazada u observada?',
      a: 'El motivo de rechazo suele deberse a: 1) Falta del número de Orden de Compra (OC) en la glosa del comprobante, 2) Discrepancia en importes o moneda respecto a la OC, 3) Omisión del archivo .XML, o 4) Falta de la conformidad previa (HES no liberada). Deberás subsanar el documento electrónico (o emitir Nota de Crédito/nueva factura según corresponda) y reenviarla a facturacion.proveedores@solgas.pe citando el motivo de corrección.'
    },
    {
      id: 2,
      category: 'facturacion',
      q: '¿A qué correo debo enviar mis facturas y archivos XML?',
      a: 'Únicamente a la casilla oficial facturacion.proveedores@solgas.pe. Es indispensable adjuntar el par digital (.XML y .PDF). Los correos enviados directamente a bandejas personales de usuarios internos o compradores no ingresan al flujo contable sistematizado y podrían quedar pendientes de pago.'
    },
    {
      id: 3,
      category: 'pagos',
      q: '¿Cómo solicito una constancia de retención o abono realizado?',
      a: 'Puedes solicitarla enviando un correo a pagosproveedores@solgas.pe indicando tu RUC, Razón Social, número de factura y fecha aproximada del servicio. Las constancias de retención electrónica también se encuentran disponibles directamente en el portal de Clave SOL de SUNAT.'
    },
    {
      id: 4,
      category: 'pagos',
      q: '¿Cómo actualizo mi cuenta bancaria (CCI) o razón social?',
      a: 'Descarga el "Formato de Registro de Proveedor y Declaración Jurada CCI" desde nuestro Centro de Documentación, complétalo y fírmalo por el Representante Legal. Adjunta la carta membretada de tu entidad bancaria donde figure el CCI y remítelo a abastecimiento@solgas.pe. La actualización toma un plazo estimado de 48 a 72 horas hábiles.'
    },
    {
      id: 5,
      category: 'seguridad',
      q: '¿Cuáles son los requisitos de seguridad (SST/HSE) para ingresar a las plantas de Solgas?',
      a: 'Para ingresar a plantas de envasado o terminales (Callao, Ventanilla, Pisco, Trujillo, etc.), todo personal contratista debe contar con: Seguro Complementario de Trabajo de Riesgo (SCTR) de Salud y Pensión vigente con nómina detallada, Pasaporte de Seguridad (inducción aprobada), EPPs normados (calzado dieléctrico, casco con barbiquejo, lentes de seguridad y chaleco reflectivo) y Permiso de Trabajo de Alto Riesgo (PETAR) si aplica.'
    },
    {
      id: 6,
      category: 'homologacion',
      q: '¿Cuánto tiempo demora el proceso de homologación para ser nuevo proveedor?',
      a: 'El proceso toma en promedio entre 7 y 15 días hábiles, dependiendo del tipo de bien o criticidad del servicio. Se evalúan 3 pilares fundamentales: Capacidad Legal y Financiera, Cumplimiento de Calidad y Comercial, y Estándares de Seguridad Operacional y Medio Ambiente (HSE).'
    },
    {
      id: 7,
      category: 'facturacion',
      q: '¿Puedo facturar un servicio sin contar con la Orden de Compra (OC) previa?',
      a: 'No. En Solgas está terminantemente prohibido prestar servicios o despachar bienes sin una Orden de Compra o Pedido de Servicio debidamente liberado en SAP. Cualquier comprobante emitido sin OC previa será rechazado automáticamente por el sistema contable.'
    }
  ];

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchSearch = faqSearch === '' || 
        faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.a.toLowerCase().includes(faqSearch.toLowerCase());
      return matchSearch;
    });
  }, [faqSearch]);

  // Micro-Instructivos Videos Data
  const tutorials = [
    {
      id: 1,
      title: 'Validación de Órdenes de Compra vs. Factura Electrónica',
      category: 'Facturación',
      duration: '3:45 min',
      desc: 'Aprende paso a paso a verificar que el número de OC, ítems, precios unitarios y moneda de tu factura coincidan exactamente con la orden emitida en SAP.'
    },
    {
      id: 2,
      title: 'Errores Más Comunes que Ocasionan el Rechazo de Facturas',
      category: 'Contabilidad',
      duration: '4:10 min',
      desc: 'Guía práctica para evitar observaciones por omisión de XML, fechas de corte contable vencidas, ausencia de HES o errores en cuentas de detracción.'
    },
    {
      id: 3,
      title: 'Procedimiento de Ingreso de Contratistas a Instalaciones Solgas',
      category: 'Seguridad (HSE)',
      duration: '5:20 min',
      desc: 'Requisitos obligatorios para operar en planta: validación de SCTR en garita, Pasaporte de Seguridad, EPPs certificados y permisos de trabajo crítico.'
    }
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* 0. TOP NOTICE BAR (AVISO DE CIERRE CONTABLE) */}
      {noticeVisible && (
        <div className={styles.noticeBar}>
          <div className={styles.noticeContent}>
            <div className={styles.noticeLeft}>
              <span className={styles.noticeBadge}>Aviso Importante</span>
              <p className={styles.noticeText}>
                <strong>Cierre contable mensual:</strong> Recepción de facturas habilitada hasta el <strong>día 25 a las 18:00 hrs</strong>. Recuerda adjuntar siempre tu par digital (.XML + .PDF) con Orden de Compra liberada.
              </p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <a href="#operativo" className={styles.noticeAction}>Ver requisitos de facturación →</a>
              <button 
                onClick={() => setNoticeVisible(false)} 
                className={styles.noticeClose}
                title="Ocultar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. NAVBAR INSTITUCIONAL SOLGAS */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logoArea}>
            <a href="#inicio">
              <img 
                src="/logos/solgas-logo-color.png" 
                alt="Solgas - Energía que Rinde" 
                className={styles.solgasLogo}
              />
            </a>
            <div className={styles.brandDivider}></div>
            <span className={styles.portalBadge}>Portal de Proveedores</span>
          </div>

          <nav className={styles.navLinks}>
            <a href="#inicio" className={styles.navLink}>Marco General</a>
            <a href="#homologacion" className={styles.navLink}>Quiero ser Proveedor</a>
            <a href="#operativo" className={styles.navLink}>Consultas y Operaciones</a>
            <a href="#capacitacion" className={styles.navLink}>Guías & Descargas</a>
            <a href="#faq" className={styles.navLink}>Preguntas Frecuentes</a>
            <a href="#contacto" className={styles.navLink}>Mesa de Ayuda</a>
          </nav>

          <button 
            className={styles.navBtnCta}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <span>⭐</span> Quiero ser Proveedor
          </button>
        </div>
      </header>

      {/* 2. HERO CORPORATIVO: MARCO GENERAL Y BIENVENIDA */}
      <section id="inicio" className={styles.heroSection}>
        <svg className={styles.heroCurveDecor} viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="250" cy="250" r="230" stroke="#FF7900" strokeWidth="18" opacity="0.6"/>
          <circle cx="280" cy="220" r="200" stroke="#FFFFFF" strokeWidth="14" opacity="0.4"/>
          <circle cx="220" cy="280" r="210" stroke="#005BBB" strokeWidth="10" opacity="0.5"/>
        </svg>

        <div className={styles.heroContent}>
          <div className={styles.heroMeta}>
            <span className={styles.heroSubBadge}>Solgas | Grupo Abastible</span>
            <span className={styles.heroAbastible}>Líderes en energía limpia, segura y eficiente en el Perú</span>
          </div>

          <h1 className={styles.heroTitle}>
            Guía y Portal de Información para <span className={styles.heroTitleHighlight}>Proveedores Solgas</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Tu canal de orientación oficial sobre procesos de homologación, facturación electrónica y lineamientos corporativos.
          </p>

          <p className={styles.heroWelcomeText}>
            «En Solgas consideramos a nuestros proveedores <strong>aliados estratégicos</strong> en el suministro de energía limpia, segura y eficiente a todo el país. Ponemos a tu disposición este portal con instructivos, canales directos y respuestas a las dudas más frecuentes sobre cómo trabajar con nosotros, enviar tus comprobantes y gestionar tus consultas operativas con total transparencia.»
          </p>

          {/* Acciones Rápidas */}
          <div className={styles.heroActionsRow}>
            <button 
              className={styles.heroActionBtnPrimary}
              onClick={() => setIsRegisterModalOpen(true)}
            >
              <span>⭐</span> Quiero ser Proveedor
            </button>
            <a href="#operativo" className={styles.heroActionBtnOutline}>
              <span>⚡</span> Consultas y Facturación
            </a>
            <a href="#capacitacion" className={styles.heroActionBtnOutline}>
              <span>📘</span> Guías y Manuales
            </a>
            <a href="#faq" className={styles.heroActionBtnOutline}>
              <span>❓</span> Preguntas Frecuentes
            </a>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DESTACADA: VIDEO TESTIMONIAL Y VALORES SOLGAS */}
      <section className={styles.videoSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.videoSectionGrid}>
            <div className={styles.videoCardWrapper}>
              <span className={styles.videoBadgeOverlay}>🎥 Video Testimonial Oficial</span>
              <video 
                controls 
                preload="metadata"
                className={styles.videoPlayer}
                poster="/fondo_solgas.jpg"
              >
                <source src="/videos/testimoniales.mp4" type="video/mp4" />
                Tu navegador no soporta la reproducción de video HTML5.
              </video>
            </div>

            <div className={styles.videoTextContent}>
              <span className={styles.sectionTag}>RINDE UN PERÚ | NUESTRA ENERGÍA</span>
              <h2 className={styles.sectionTitle}>Nuestra energía a través de nuestros aliados</h2>
              <p className={styles.sectionParagraph}>
                En Solgas impulsamos el desarrollo sostenible y la reactivación de empresas peruanas de todos los tamaños. Conoce cómo nuestros proveedores y contratistas consolidan relaciones de largo plazo basadas en la excelencia, seguridad industrial y puntualidad.
              </p>

              <div className={styles.brandPillarsList}>
                <div className={styles.pillarItem}>
                  <span className={styles.pillarIcon}>🔒</span>
                  <div>
                    <h4 className={styles.pillarTitle}>Seguridad Operativa y HSE</h4>
                    <p className={styles.pillarDesc}>Compromiso inquebrantable con la protección de las personas y el medio ambiente.</p>
                  </div>
                </div>

                <div className={styles.pillarItem}>
                  <span className={styles.pillarIcon}>⚡</span>
                  <div>
                    <h4 className={styles.pillarTitle}>Máximo Rendimiento e Integridad</h4>
                    <p className={styles.pillarDesc}>Operamos bajo estrictos estándares éticos, transparencia contable y cumplimiento tributario.</p>
                  </div>
                </div>

                <div className={styles.pillarItem}>
                  <span className={styles.pillarIcon}>🤝</span>
                  <div>
                    <h4 className={styles.pillarTitle}>Relaciones de Confianza Mutua</h4>
                    <p className={styles.pillarDesc}>Garantía de procesos ágiles, pagos puntuales y soporte continuo a tu empresa.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN HOMOLOGACIÓN Y NUEVOS PROVEEDORES */}
      <section id="homologacion" className={styles.homologacionSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionTag}>PROCESO DE HOMOLOGACIÓN</span>
            <h2 className={styles.sectionTitle}>¿Deseas ser proveedor de Solgas?</h2>
            <p className={styles.sectionParagraph}>
              «Si ofreces productos o servicios y buscas integrarte a nuestra cadena de valor, inicia aquí tu proceso de registro y evaluación formal.»
            </p>
          </div>

          {/* Checklist Interactivo de Requisitos */}
          <div className={styles.checklistGrid}>
            <div 
              className={`${styles.checklistItem} ${checklist.ruc ? styles.checked : ''}`}
              onClick={() => toggleChecklist('ruc')}
            >
              <div className={styles.itemTopRow}>
                <span className={styles.itemNumber}>01</span>
                <div className={styles.checkboxIndicator}>{checklist.ruc ? '✓' : ''}</div>
              </div>
              <div>
                <h3 className={styles.itemTitle}>RUC Activo y Habido</h3>
                <p className={styles.itemDesc}>Inscrito formalmente en SUNAT, con domicilio fiscal verificado y sin condición de no habido.</p>
              </div>
            </div>

            <div 
              className={`${styles.checklistItem} ${checklist.cci ? styles.checked : ''}`}
              onClick={() => toggleChecklist('cci')}
            >
              <div className={styles.itemTopRow}>
                <span className={styles.itemNumber}>02</span>
                <div className={styles.checkboxIndicator}>{checklist.cci ? '✓' : ''}</div>
              </div>
              <div>
                <h3 className={styles.itemTitle}>Constancia Bancaria CCI</h3>
                <p className={styles.itemDesc}>Carta bancaria oficial con Código de Cuenta Interbancario (CCI) en moneda nacional o extranjera.</p>
              </div>
            </div>

            <div 
              className={`${styles.checklistItem} ${checklist.ficha ? styles.checked : ''}`}
              onClick={() => toggleChecklist('ficha')}
            >
              <div className={styles.itemTopRow}>
                <span className={styles.itemNumber}>03</span>
                <div className={styles.checkboxIndicator}>{checklist.ficha ? '✓' : ''}</div>
              </div>
              <div>
                <h3 className={styles.itemTitle}>Ficha RUC Actualizada</h3>
                <p className={styles.itemDesc}>CIIU y actividad económica declarada coherente con el tipo de bien o servicio ofrecido.</p>
              </div>
            </div>

            <div 
              className={`${styles.checklistItem} ${checklist.portfolio ? styles.checked : ''}`}
              onClick={() => toggleChecklist('portfolio')}
            >
              <div className={styles.itemTopRow}>
                <span className={styles.itemNumber}>04</span>
                <div className={styles.checkboxIndicator}>{checklist.portfolio ? '✓' : ''}</div>
              </div>
              <div>
                <h3 className={styles.itemTitle}>Portafolio Comercial</h3>
                <p className={styles.itemDesc}>Carta de presentación técnica, experiencia comprobada en el rubro y principales clientes.</p>
              </div>
            </div>

            <div 
              className={`${styles.checklistItem} ${checklist.seguridad ? styles.checked : ''}`}
              onClick={() => toggleChecklist('seguridad')}
            >
              <div className={styles.itemTopRow}>
                <span className={styles.itemNumber}>05</span>
                <div className={styles.checkboxIndicator}>{checklist.seguridad ? '✓' : ''}</div>
              </div>
              <div>
                <h3 className={styles.itemTitle}>Estándares de Seguridad</h3>
                <p className={styles.itemDesc}>Obligatorio para contratistas de planta o campo (SCTR Salud/Pensión vigente, Pasaporte y EPPs).</p>
              </div>
            </div>
          </div>

          {/* Barra de Progreso del Checklist */}
          <div className={styles.progressSummaryCard}>
            <div className={styles.progressBarArea}>
              <div className={styles.progressLabelRow}>
                <span>Tu nivel de preparación para postular:</span>
                <span>{checklistCount} de 5 requisitos ({checklistProgress}%)</span>
              </div>
              <div className={styles.progressBarBg}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${checklistProgress}%` }}
                ></div>
              </div>
            </div>

            <p style={{fontSize: '13.5px', color: '#64748B', maxWidth: '380px'}}>
              {checklistCount === 5 
                ? '🎉 ¡Excelente! Cumples con el 100% de los requisitos para iniciar tu homologación.' 
                : '💡 Haz clic en cada tarjeta para verificar los documentos que tienes listos.'}
            </p>
          </div>

          {/* Botones de Acción de Homologación */}
          <div className={styles.homologacionCtasRow}>
            <button 
              className={styles.btnPrimaryCta}
              onClick={() => setIsRegisterModalOpen(true)}
            >
              <span>📝</span> Completar Formulario de Homologación
            </button>

            <a 
              href="/downloads/Procedimiento Homologación.pdf" 
              download 
              className={styles.btnSecondaryDownload}
            >
              <span>📥</span> Descargar Requisitos (PDF)
            </a>

            <a 
              href="/downloads/Formulario_Registro_Proveedor_SOLGAS_2026.xlsx" 
              download 
              className={styles.btnExcelDownload}
            >
              <span>📊</span> Plantilla Registro y Cuentas CCI (Excel)
            </a>

            <a 
              href="/downloads/ACHILLES - SOLGAS.pdf" 
              download 
              className={styles.btnSecondaryDownload}
            >
              <span>🛡️</span> Guía Achilles Homologación
            </a>
          </div>
        </div>
      </section>

      {/* 5. MÓDULO DE CONSULTAS Y OPERACIONES (BENCHMARK ARCA CONTINENTAL & NESTLÉ) */}
      <section id="operativo" className={styles.operativoSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionTag}>ORIENTACIÓN OPERATIVA DIARIA</span>
            <h2 className={styles.sectionTitle}>Módulo de Consultas y Operaciones</h2>
            <p className={styles.sectionParagraph}>
              Haz clic en cualquiera de las 4 áreas operativas para consultar de inmediato la guía paso a paso, fechas de pago, tratamiento tributario y resolución de observaciones:
            </p>
          </div>

          {/* 4 Grandes Bloques de Selección Estilo Arca Continental / Nestlé */}
          <div className={styles.benchmarkSelectorGrid}>
            <button 
              className={`${styles.benchmarkCardBtn} ${activeConsultationId === 'facturacion' ? styles.active : ''}`}
              onClick={() => setActiveConsultationId('facturacion')}
            >
              <div className={styles.benchmarkIconBadge}>📄</div>
              <div className={styles.benchmarkCardTitle}>Comprobantes y Facturación</div>
              <div className={styles.benchmarkCardHint}>Par digital (.XML y .PDF), OC y fecha de corte</div>
            </button>

            <button 
              className={`${styles.benchmarkCardBtn} ${activeConsultationId === 'pagos' ? styles.active : ''}`}
              onClick={() => setActiveConsultationId('pagos')}
            >
              <div className={styles.benchmarkIconBadge}>💳</div>
              <div className={styles.benchmarkCardTitle}>Días y Plazos de Pago</div>
              <div className={styles.benchmarkCardHint}>Abonos semanales Jueves/Viernes y plazos CCI</div>
            </button>

            <button 
              className={`${styles.benchmarkCardBtn} ${activeConsultationId === 'detracciones' ? styles.active : ''}`}
              onClick={() => setActiveConsultationId('detracciones')}
            >
              <div className={styles.benchmarkIconBadge}>🏛️</div>
              <div className={styles.benchmarkCardTitle}>Detracciones y Retenciones</div>
              <div className={styles.benchmarkCardHint}>Banco de la Nación, SPOT y Agente Retención 3%</div>
            </button>

            <button 
              className={`${styles.benchmarkCardBtn} ${activeConsultationId === 'conformidad' ? styles.active : ''}`}
              onClick={() => setActiveConsultationId('conformidad')}
            >
              <div className={styles.benchmarkIconBadge}>✅</div>
              <div className={styles.benchmarkCardTitle}>Criterios de Aprobación</div>
              <div className={styles.benchmarkCardHint}>Conformidad previa: HES y Guías de almacén</div>
            </button>
          </div>

          {/* Panel Desplegado de Detalle y Autogestión (Siempre visible y reactivo) */}
          <div className={styles.activeConsultationPanel}>
            <div className={styles.panelHeaderRow}>
              <div className={styles.panelHeaderLeft}>
                <div className={styles.panelBigIcon}>{currentConsultation.icon}</div>
                <div>
                  <h3 className={styles.panelTitle}>{currentConsultation.title}</h3>
                  <p className={styles.panelSubtitle}>{currentConsultation.hint}</p>
                </div>
              </div>

              <div className={styles.panelKeyAlertBadge}>
                {currentConsultation.keyAlert}
              </div>
            </div>

            <div className={styles.panelContentGrid}>
              {/* Columna Izquierda: Guía Paso a Paso */}
              <div>
                <h4 style={{fontSize: '16px', fontWeight: '800', color: 'var(--solgas-blue)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span>📌</span> Procedimiento y Pautas Obligatorias
                </h4>

                <div className={styles.panelStepList}>
                  {currentConsultation.steps.map((step, idx) => (
                    <div key={idx} className={styles.panelStepItem}>
                      <span className={styles.stepBadgeNum}>{idx + 1}</span>
                      <div>
                        <h5 className={styles.stepTextTitle}>{step.title}</h5>
                        <p className={styles.stepTextDesc}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Resolución de Problemas Frecuentes estilo Nestlé */}
              <div>
                <div className={styles.panelTroubleshootCol}>
                  <div className={styles.troubleshootHeader}>
                    <span>💡</span> Problemas Comunes y Solución Inmediata
                  </div>

                  {currentConsultation.troubleshoot.map((item, idx) => (
                    <div key={idx} className={styles.troubleshootItem}>
                      <div className={styles.troubleshootQ}>{item.q}</div>
                      <div className={styles.troubleshootA}>{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra Inferior de Acción Inmediata */}
            <div className={styles.panelFooterBar}>
              <button 
                className={styles.panelDirectActionBtn}
                onClick={() => handleCopy(currentConsultation.actionBtnValue)}
              >
                <span>📋</span> {copiedEmail === currentConsultation.actionBtnValue ? '✓ ¡Correo Copiado!' : `${currentConsultation.actionBtnText} (${currentConsultation.actionBtnValue})`}
              </button>

              <a href="#contacto" className={styles.panelHelpLink}>
                ¿Tienes una consulta específica? Escribe a la Mesa de Ayuda →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CENTRO DE CAPACITACIÓN Y DOCUMENTACIÓN DESCARGABLE (ESTILO EQUILIBRA) */}
      <section id="capacitacion" className={styles.capacitacionSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionTag}>CENTRO DE FORMACIÓN Y DESCARGAS</span>
            <h2 className={styles.sectionTitle}>Documentación y Recursos para Proveedores</h2>
            <p className={styles.sectionParagraph}>
              Descarga los manuales oficiales, formatos requeridos y visualiza micro-instructivos didácticos para operar con éxito en Solgas.
            </p>
          </div>

          <div className={styles.capacitacionTabsRow}>
            <div className={styles.capTabsGroup}>
              <button 
                className={`${styles.capTabBtn} ${activeCapTab === 'documentos' ? styles.active : ''}`}
                onClick={() => setActiveCapTab('documentos')}
              >
                📄 Formatos y Manuales Oficiales (PDF / Excel)
              </button>
              <button 
                className={`${styles.capTabBtn} ${activeCapTab === 'videos' ? styles.active : ''}`}
                onClick={() => setActiveCapTab('videos')}
              >
                🎬 Micro-Instructivos en Video
              </button>
            </div>
          </div>

          {activeCapTab === 'documentos' && (
            <div className={styles.downloadsGrid}>
              <div className={styles.downloadCard}>
                <div className={`${styles.fileIconCol} ${styles.fileIconPdf}`}>PDF</div>
                <div className={styles.fileMetaCol}>
                  <h4 className={styles.fileName}>Manual de Seguridad para Contratistas</h4>
                  <p className={styles.fileDesc}>Requisitos de ingreso a plantas, normas EPP, SCTR e inducción de seguridad.</p>
                  <span className={styles.fileSpecs}>Versión Oficial Solgas • 2.5 MB • PDF</span>
                </div>
                <a 
                  href="/downloads/Manual_Seguridad_Contratistas_Solgas.pdf" 
                  download 
                  className={styles.downloadBtnIcon}
                  title="Descargar Manual de Seguridad"
                >
                  ↓
                </a>
              </div>

              <div className={styles.downloadCard}>
                <div className={`${styles.fileIconCol} ${styles.fileIconXls}`}>XLS</div>
                <div className={styles.fileMetaCol}>
                  <h4 className={styles.fileName}>Formato de Registro y Declaración CCI</h4>
                  <p className={styles.fileDesc}>Plantilla oficial para registro de datos bancarios, contactos y representante legal.</p>
                  <span className={styles.fileSpecs}>Plantilla Oficial SAP • 48 KB • Excel</span>
                </div>
                <a 
                  href="/downloads/Formulario_Registro_Proveedor_SOLGAS_2026.xlsx" 
                  download 
                  className={styles.downloadBtnIcon}
                  title="Descargar Plantilla Excel"
                >
                  ↓
                </a>
              </div>

              <div className={styles.downloadCard}>
                <div className={`${styles.fileIconCol} ${styles.fileIconPdf}`}>PDF</div>
                <div className={styles.fileMetaCol}>
                  <h4 className={styles.fileName}>Procedimiento de Homologación</h4>
                  <p className={styles.fileDesc}>Criterios de evaluación técnica, legal, financiera y estándares HSE.</p>
                  <span className={styles.fileSpecs}>Normativa Corporativa • 247 KB • PDF</span>
                </div>
                <a 
                  href="/downloads/Procedimiento Homologación.pdf" 
                  download 
                  className={styles.downloadBtnIcon}
                  title="Descargar Procedimiento"
                >
                  ↓
                </a>
              </div>

              <div className={styles.downloadCard}>
                <div className={`${styles.fileIconCol} ${styles.fileIconPdf}`}>PDF</div>
                <div className={styles.fileMetaCol}>
                  <h4 className={styles.fileName}>Procedimiento de Gestión de Adquisiciones</h4>
                  <p className={styles.fileDesc}>Lineamientos para compras de bienes, adjudicaciones y órdenes de compra.</p>
                  <span className={styles.fileSpecs}>Normativa Oficial • 1.2 MB • PDF</span>
                </div>
                <a 
                  href="/downloads/Procedimiento_Gestion_Adquisicion_Bienes_Servicios.pdf" 
                  download 
                  className={styles.downloadBtnIcon}
                  title="Descargar Procedimiento Adquisiciones"
                >
                  ↓
                </a>
              </div>

              <div className={styles.downloadCard}>
                <div className={`${styles.fileIconCol} ${styles.fileIconPdf}`}>PDF</div>
                <div className={styles.fileMetaCol}>
                  <h4 className={styles.fileName}>Guía Plataforma Achilles Solgas</h4>
                  <p className={styles.fileDesc}>Manual de usuario para registro y homologación externa a través de Achilles.</p>
                  <span className={styles.fileSpecs}>Instructivo de Plataforma • 1.0 MB • PDF</span>
                </div>
                <a 
                  href="/downloads/ACHILLES - SOLGAS.pdf" 
                  download 
                  className={styles.downloadBtnIcon}
                  title="Descargar Guía Achilles"
                >
                  ↓
                </a>
              </div>

              <div className={styles.downloadCard}>
                <div className={`${styles.fileIconCol} ${styles.fileIconPdf}`}>PDF</div>
                <div className={styles.fileMetaCol}>
                  <h4 className={styles.fileName}>Propuesta de Homologación de Proveedores</h4>
                  <p className={styles.fileDesc}>Presentación detallada de fases, beneficios y alcance de la homologación.</p>
                  <span className={styles.fileSpecs}>Documento Estratégico • 2.4 MB • PDF</span>
                </div>
                <a 
                  href="/downloads/Propuesta-de-Homologacion-de-Proveedores SOLGAS v1.pdf" 
                  download 
                  className={styles.downloadBtnIcon}
                  title="Descargar Propuesta"
                >
                  ↓
                </a>
              </div>
            </div>
          )}

          {activeCapTab === 'videos' && (
            <div className={styles.videosTutorialGrid}>
              {tutorials.map(tut => (
                <div 
                  key={tut.id} 
                  className={styles.videoTutorialCard}
                  onClick={() => setVideoModal(tut)}
                >
                  <div className={styles.tutorialThumbWrapper}>
                    <div className={styles.tutorialPlayBtn}>▶</div>
                    <span className={styles.tutorialDuration}>{tut.duration}</span>
                  </div>
                  <div className={styles.tutorialBody}>
                    <div className={styles.tutorialCategory}>{tut.category}</div>
                    <h4 className={styles.tutorialTitle}>{tut.title}</h4>
                    <p className={styles.tutorialExcerpt}>{tut.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. SECCIÓN PREGUNTAS FRECUENTES (FAQ ACORDEÓN INTERACTIVO) */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionTag}>RESPUESTAS OPERATIVAS DIRECTAS</span>
            <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
            <p className={styles.sectionParagraph}>
              Respuestas rápidas a las principales dudas operativas, contables y administrativas reportadas por nuestros proveedores.
            </p>
          </div>

          <div className={styles.faqSearchWrapper}>
            <span className={styles.faqSearchIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar en preguntas frecuentes (ej. factura rechazada, correo contable, CCI, plazo)..." 
              className={styles.faqSearchInput}
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
            />
          </div>

          <div className={styles.faqAccordionList}>
            {filteredFaqs.map(faq => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}
                >
                  <button 
                    className={styles.faqQuestionBtn}
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  >
                    <span className={styles.faqQuestionText}>{faq.q}</span>
                    <span className={styles.faqToggleIcon}>{isOpen ? '−' : '+'}</span>
                  </button>

                  {isOpen && (
                    <div className={styles.faqAnswerBox}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div style={{textAlign: 'center', padding: '36px', color: '#64748B'}}>
                No encontramos preguntas que coincidan con tu búsqueda. Puedes consultar directamente a la <strong>Mesa de Ayuda</strong>.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. CANAL DE MESA DE AYUDA Y CONTACTO (MATRIZ DE DERIVACIÓN OFICIAL) */}
      <section id="contacto" className={styles.contactoSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionTag}>CANALES OFICIALES DE ATENCIÓN</span>
            <h2 className={styles.sectionTitle}>Mesa de Ayuda y Directorio de Contacto</h2>
            <p className={styles.sectionParagraph}>
              Comunícate directamente con el área especializada de Solgas para resolver tu requerimiento sin triangulaciones.
            </p>
          </div>

          <div className={styles.helpdeskCardsGrid}>
            <div className={styles.helpdeskCard}>
              <div className={styles.helpdeskIcon}>💳</div>
              <h3 className={styles.helpdeskAreaName}>Consultas de Pago y Facturación</h3>
              <p className={styles.helpdeskDesc}>
                Estado de comprobantes, reprogramaciones de pago, constancias de retención, detracciones y soporte contable.
              </p>

              <div className={styles.helpdeskDetailsBox}>
                <div className={styles.helpdeskEmailRow}>
                  <span className={styles.helpdeskEmailText}>pagosproveedores@solgas.pe</span>
                </div>
                <div className={styles.helpdeskHoursRow}>
                  <span>🕒</span> Lun - Vie: 8:30 a 17:30 hrs
                </div>
              </div>

              <div className={styles.helpdeskActionsRow}>
                <button 
                  className={styles.btnCopyEmail}
                  onClick={() => handleCopy('pagosproveedores@solgas.pe')}
                >
                  {copiedEmail === 'pagosproveedores@solgas.pe' ? '✓ Copiado' : '📋 Copiar'}
                </button>
                <a 
                  href="mailto:pagosproveedores@solgas.pe?subject=Consulta%20de%20Pago%20-%20Proveedor" 
                  className={styles.btnSendEmail}
                >
                  ✉️ Escribir
                </a>
              </div>
            </div>

            <div className={styles.helpdeskCard}>
              <div className={styles.helpdeskIcon}>🤝</div>
              <h3 className={styles.helpdeskAreaName}>Homologación y Negociaciones</h3>
              <p className={styles.helpdeskDesc}>
                Incorporación de nuevos proveedores, actualización de expedientes CCI, contratos y cotizaciones comerciales.
              </p>

              <div className={styles.helpdeskDetailsBox}>
                <div className={styles.helpdeskEmailRow}>
                  <span className={styles.helpdeskEmailText}>abastecimiento@solgas.pe</span>
                </div>
                <div className={styles.helpdeskHoursRow}>
                  <span>🕒</span> Lun - Vie: 8:30 a 17:30 hrs
                </div>
              </div>

              <div className={styles.helpdeskActionsRow}>
                <button 
                  className={styles.btnCopyEmail}
                  onClick={() => handleCopy('abastecimiento@solgas.pe')}
                >
                  {copiedEmail === 'abastecimiento@solgas.pe' ? '✓ Copiado' : '📋 Copiar'}
                </button>
                <a 
                  href="mailto:abastecimiento@solgas.pe?subject=Homologaci%C3%B3n%20y%20Registro%20Proveedor" 
                  className={styles.btnSendEmail}
                >
                  ✉️ Escribir
                </a>
              </div>
            </div>

            <div className={styles.helpdeskCard}>
              <div className={styles.helpdeskIcon}>🛡️</div>
              <h3 className={styles.helpdeskAreaName}>Ingreso a Plantas y Seguridad (SST)</h3>
              <p className={styles.helpdeskDesc}>
                Validación de pólizas SCTR, Pasaporte de Seguridad, permisos de trabajo en caliente o altura e inducciones en planta.
              </p>

              <div className={styles.helpdeskDetailsBox}>
                <div className={styles.helpdeskEmailRow}>
                  <span className={styles.helpdeskEmailText}>seguridadoperativa@solgas.pe</span>
                </div>
                <div className={styles.helpdeskHoursRow}>
                  <span>🕒</span> Lun - Vie: 8:00 a 17:00 hrs
                </div>
              </div>

              <div className={styles.helpdeskActionsRow}>
                <button 
                  className={styles.btnCopyEmail}
                  onClick={() => handleCopy('seguridadoperativa@solgas.pe')}
                >
                  {copiedEmail === 'seguridadoperativa@solgas.pe' ? '✓ Copiado' : '📋 Copiar'}
                </button>
                <a 
                  href="mailto:seguridadoperativa@solgas.pe?subject=Ingreso%20a%20Planta%20-%20SCTR%20y%20Seguridad" 
                  className={styles.btnSendEmail}
                >
                  ✉️ Escribir
                </a>
              </div>
            </div>

            <div className={`${styles.helpdeskCard} ${styles.ethicalChannel}`}>
              <div className={styles.helpdeskIcon}>⚖️</div>
              <h3 className={styles.helpdeskAreaName} style={{color: '#FFA726'}}>Línea Ética y Denuncias</h3>
              <p className={styles.helpdeskDesc}>
                Canal confidencial e independiente para reportar actos contrarios al Código de Ética, conductas indebidas o irregularidades.
              </p>

              <div className={styles.helpdeskDetailsBox}>
                <div className={styles.helpdeskEmailRow}>
                  <span className={styles.helpdeskEmailText}>lineaetica@solgas.pe</span>
                </div>
                <div className={styles.helpdeskHoursRow}>
                  <span>🔒</span> Atención 24/7 • Canal Anónimo Garantizado
                </div>
              </div>

              <div className={styles.helpdeskActionsRow}>
                <button 
                  className={styles.btnCopyEmail}
                  style={{background: 'rgba(255,255,255,0.15)', color: '#FFFFFF'}}
                  onClick={() => handleCopy('lineaetica@solgas.pe')}
                >
                  {copiedEmail === 'lineaetica@solgas.pe' ? '✓ Copiado' : '📋 Copiar'}
                </button>
                <a 
                  href="mailto:lineaetica@solgas.pe?subject=Reporte%20Confidencial%20L%C3%ADnea%20%C3%89tica" 
                  className={styles.btnSendEmail}
                  style={{background: '#FFA726', color: '#071746'}}
                >
                  🛡️ Reportar Caso
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER INSTITUCIONAL SOLGAS (BRANDBOOK COMPLIANT) */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrandCol}>
            <img 
              src="/logos/solgas-logo-white.png" 
              alt="Solgas" 
              className={styles.footerLogo}
            />
            <p className={styles.footerTagline}>
              Solgas S.A., una empresa del Grupo Abastible. Líder en el abastecimiento confiable, seguro y eficiente de Gas Licuado de Petróleo (GLP) para hogares, comercios e industrias de todo el Perú.
            </p>
            <p style={{fontSize: '13px', color: '#FFA726', fontWeight: '700'}}>
              RINDE UN PERÚ • ES NUESTRA ESENCIA
            </p>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Navegación Rápida</h4>
            <ul className={styles.footerLinksList}>
              <li><a href="#inicio" className={styles.footerLink}>Marco General</a></li>
              <li><a href="#homologacion" className={styles.footerLink}>Requisitos de Homologación</a></li>
              <li><a href="#operativo" className={styles.footerLink}>Módulo de Facturación</a></li>
              <li><a href="#capacitacion" className={styles.footerLink}>Descarga de Formatos y Guías</a></li>
              <li><a href="#faq" className={styles.footerLink}>Preguntas Frecuentes</a></li>
              <li><a href="#contacto" className={styles.footerLink}>Mesa de Ayuda</a></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Enlaces Corporativos</h4>
            <ul className={styles.footerLinksList}>
              <li><a href="https://www.solgas.com.pe" target="_blank" rel="noreferrer" className={styles.footerLink}>Sitio Web Oficial Solgas</a></li>
              <li><a href="https://www.abastible.cl" target="_blank" rel="noreferrer" className={styles.footerLink}>Grupo Abastible S.A.</a></li>
              <li><a href="/downloads/Procedimiento_Gestion_Adquisicion_Bienes_Servicios.pdf" download className={styles.footerLink}>Política de Adquisiciones</a></li>
              <li><a href="/downloads/Manual_Seguridad_Contratistas_Solgas.pdf" download className={styles.footerLink}>Manual de Seguridad en Planta</a></li>
              <li><a href="#contacto" className={styles.footerLink}>Canal Ético y Cumplimiento</a></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Sede Central & Atención</h4>
            <div className={styles.footerContactItem}>
              <span>📍</span>
              <span>Av. República de Panamá 3505, Piso 11, San Isidro, Lima - Perú</span>
            </div>
            <div className={styles.footerContactItem}>
              <span>🏭</span>
              <span>Terminal Callao: Av. Néstor Gambetta Km 8.5, Callao</span>
            </div>
            <div className={styles.footerContactItem}>
              <span>📞</span>
              <span>Central Telefónica: (01) 613-3333</span>
            </div>
            <div className={styles.footerContactItem}>
              <span>✉️</span>
              <span>proveedores@solgas.pe</span>
            </div>
          </div>
        </div>

        <div className={styles.footerBottomBar}>
          <div>
            © 2026 SOLGAS S.A. Todos los derechos reservados. RUC 20100176450.
          </div>
          <div>
            Portal Oficial de Orientación y Homologación para Proveedores.
          </div>
        </div>
      </footer>

      {/* ----------------------------------------------------------------------
          MODAL 1: FORMULARIO INTERACTIVO DE HOMOLOGACIÓN ("QUIERO SER PROVEEDOR")
          ---------------------------------------------------------------------- */}
      {isRegisterModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsRegisterModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => { setIsRegisterModalOpen(false); setRegisterSuccess(null); }}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>Formulario de Registro para Nuevos Proveedores</h3>
              <p className={styles.modalSubtitle}>
                Ingresa los datos de tu empresa para que nuestro equipo de Abastecimiento evalúe tu perfil.
              </p>
            </div>

            <div className={styles.modalBody}>
              {registerSuccess ? (
                <div className={styles.modalSuccessBox}>
                  <div className={styles.successIconCircle}>✓</div>
                  <h3 style={{fontSize: '22px', color: 'var(--solgas-blue)', fontWeight: '800'}}>
                    ¡Solicitud de Registro Enviada con Éxito!
                  </h3>
                  <p style={{fontSize: '14.5px', color: '#475569', marginTop: '10px'}}>
                    Hemos registrado los antecedentes de <strong>{formData.razonSocial || 'tu empresa'}</strong>. Tu número de ticket de seguimiento es:
                  </p>
                  <div className={styles.successTicketPill}>
                    {registerSuccess}
                  </div>
                  <p style={{fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', maxWidth: '480px', margin: '0 auto 24px'}}>
                    Un comprador del área de Abastecimiento de Solgas revisará tu información y te contactará en un plazo de 3 a 5 días hábiles a la casilla <strong>{formData.email}</strong>.
                  </p>
                  <button 
                    className={styles.formSubmitBtn}
                    onClick={() => { setIsRegisterModalOpen(false); setRegisterSuccess(null); }}
                  >
                    Entendido y Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <div className={styles.formGrid}>
                    <div>
                      <label className={styles.formLabel}>RUC de la Empresa (*)</label>
                      <input 
                        type="text" 
                        required 
                        maxLength={11}
                        placeholder="Ej. 20123456789" 
                        className={styles.formInput}
                        value={formData.ruc}
                        onChange={(e) => setFormData({...formData, ruc: e.target.value.replace(/\D/g,'')})}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>Razón Social (*)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Servicios Industriales del Perú S.A.C." 
                        className={styles.formInput}
                        value={formData.razonSocial}
                        onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>Nombre de Contacto / Representante (*)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Juan Pérez" 
                        className={styles.formInput}
                        value={formData.contacto}
                        onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>Correo Electrónico de Contacto (*)</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="contacto@empresa.com" 
                        className={styles.formInput}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>Teléfono / Celular (*)</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="987 654 321" 
                        className={styles.formInput}
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>Tipo de Oferta (*)</label>
                      <select 
                        className={styles.formSelect}
                        value={formData.tipo}
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      >
                        <option value="Servicios">Prestación de Servicios</option>
                        <option value="Bienes">Suministro de Bienes / Materiales</option>
                        <option value="Ambos">Bienes y Servicios</option>
                      </select>
                    </div>

                    <div>
                      <label className={styles.formLabel}>Especialidad / Categoría (*)</label>
                      <select 
                        className={styles.formSelect}
                        value={formData.categoria}
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      >
                        <option value="Mantenimiento Industrial">Mantenimiento de Plantas y Válvulas</option>
                        <option value="Transporte y Fletes">Transporte y Logística de GLP</option>
                        <option value="Obras Civiles">Obras Civiles y Estructuras</option>
                        <option value="EPP y Seguridad">Suministro de EPPs y Seguridad Industrial</option>
                        <option value="Tecnología y TI">Tecnología, Software y Telecomunicaciones</option>
                        <option value="Consultoría y Auditoría">Consultoría Legal, Financiera y Ambiental</option>
                        <option value="Otros">Otros Servicios Especializados</option>
                      </select>
                    </div>

                    <div>
                      <label className={styles.formLabel}>Departamento / Región Principal (*)</label>
                      <select 
                        className={styles.formSelect}
                        value={formData.departamento}
                        onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                      >
                        <option value="Lima">Lima y Callao</option>
                        <option value="Arequipa">Arequipa</option>
                        <option value="La Libertad">La Libertad (Trujillo)</option>
                        <option value="Piura">Piura</option>
                        <option value="Cusco">Cusco</option>
                        <option value="Ica">Ica (Pisco)</option>
                        <option value="Lambayeque">Lambayeque (Chiclayo)</option>
                        <option value="Junín">Junín (Huancayo)</option>
                        <option value="Nacional">Cobertura Nacional</option>
                      </select>
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>Breve resumen de tu experiencia o portafolio</label>
                      <textarea 
                        className={styles.formTextarea}
                        placeholder="Detalla tus capacidades técnicas, clientes representativos o certificaciones (ISO, SCTR, etc.)..."
                        value={formData.mensaje}
                        onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className={styles.formSubmitBtn}>
                    Enviar Solicitud de Homologación →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          MODAL 2: MICRO-INSTRUCTIVO DIDÁCTICO
          ---------------------------------------------------------------------- */}
      {videoModal && (
        <div className={styles.modalBackdrop} onClick={() => setVideoModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.modalCloseBtn} onClick={() => setVideoModal(null)}>✕</button>
              <h3 className={styles.modalTitle}>{videoModal.title}</h3>
              <p className={styles.modalSubtitle}>Módulo Formativo Solgas • {videoModal.category}</p>
            </div>

            <div className={styles.modalBody}>
              <div style={{borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', marginBottom: '20px'}}>
                <video 
                  controls 
                  autoPlay 
                  className={styles.videoPlayer}
                  poster="/fondo_solgas.jpg"
                >
                  <source src="/videos/testimoniales.mp4" type="video/mp4" />
                  Tu navegador no soporta video.
                </video>
              </div>

              <h4 style={{fontSize: '16px', color: 'var(--solgas-blue)', fontWeight: '800', marginBottom: '8px'}}>
                Objetivo del módulo formativo
              </h4>
              <p style={{fontSize: '14px', color: '#475569', lineHeight: '1.6'}}>
                {videoModal.desc}
              </p>

              <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                <button 
                  className={styles.btnSecondaryDownload}
                  onClick={() => setVideoModal(null)}
                >
                  Cerrar
                </button>
                <a 
                  href="/downloads/Manual_Seguridad_Contratistas_Solgas.pdf" 
                  download 
                  className={styles.btnPrimaryCta}
                >
                  Descargar Guía Relacionada
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
