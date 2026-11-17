import './globals.css'

export const metadata = {
  title: 'Portal de Proveedores Solgas | Guía Oficial, Homologación y Facturación',
  description: 'Canal oficial de orientación para proveedores Solgas: procesos de homologación, facturación electrónica, lineamientos corporativos, normas de seguridad y mesa de ayuda.',
  keywords: 'Solgas, proveedores, homologación, facturación electrónica, Abastible, SCTR, portal proveedores, GLP Perú',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logos/solgas-logo-color.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
