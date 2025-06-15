/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ignoreDuringBuilds: true, // ✅ This will now be respected by Vercel
  },
};

module.exports = nextConfig;
