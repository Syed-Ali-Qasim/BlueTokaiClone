import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disables ESLint errors during Vercel builds
  },
};

export default nextConfig;
