/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Genera HTML/CSS/JS estático
  images: {
    unoptimized: true, // GitHub Pages no soporta optimización de imágenes nativa de Next.js
  },
  // Nombre de tu repositorio en GitHub
  basePath: '/ventasCremas', 
  // Asegura que los assets (JS/CSS) también usen el prefijo
  assetPrefix: '/ventasCremas/', 
};

export default nextConfig;
