require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wonderful-authority-53f77a5deb.strapiapp.com',
        port: process.env.NEXT_PUBLIC_STRAPI_PORT || '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'wonderful-authority-53f77a5deb.media.strapiapp.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
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