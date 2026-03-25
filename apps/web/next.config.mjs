/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Genera HTML/CSS/JS estático
  images: {
    unoptimized: true, // GitHub Pages no soporta optimización de imágenes nativa de Next.js
  },
  // Si tu repo se llama /ventasCremas, descomenta la siguiente línea:
  // basePath: '/ventasCremas', 
};

export default nextConfig;
