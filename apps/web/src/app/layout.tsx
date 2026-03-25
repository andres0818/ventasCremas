import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'SkinClear - La crema que tu rostro merece',
  description: 'Aclara manchas y unifica el tono de tu piel con la tecnología de SkinClear. Resultados visibles en 15 días.',
  openGraph: {
    title: 'SkinClear - Belleza y Claridad',
    description: 'Elimina manchas de acné, sol y edad.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased text-slate-900 bg-white">{children}</body>
    </html>
  );
}
