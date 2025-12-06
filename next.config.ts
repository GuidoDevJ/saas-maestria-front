import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Configuración para AWS Amplify Hosting con WEB_COMPUTE (SSR)
  output: 'standalone', // Requerido para AWS Amplify con Next.js SSR
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false, // Permite optimización de imágenes en SSR
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
