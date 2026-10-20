import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mercadal/shared-types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: '100.124.132.48',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
      },
    ],
  },
}

export default nextConfig
