require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_STRAPI_PROTOCOL || 'https',
        hostname: process.env.NEXT_PUBLIC_STRAPI_DOMAIN,
        port: process.env.NEXT_PUBLIC_STRAPI_PORT || '', // leave empty for production
        pathname: '/uploads/**',
      },
    ],
    domains: [
      process.env.NEXT_PUBLIC_STRAPI_DOMAIN,
      'localhost', // include this explicitly for safety
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
