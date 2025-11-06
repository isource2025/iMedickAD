import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iMedicAD',
  description: 'Sistema de Auditorías Médicas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
